wagofn = {
    // collect user and global variables
    collectVars: function(req, res, next) {
        var async = require('async');
        var fs = require('fs');

        async.parallel([
            function(cb) {  // find unread comments
                res.locals.unreadComments = []
                if (req.user) {
                    var Comment = require('./models/comment');                 
                    Comment.find({usersTagged: {$elemMatch: {userID: req.user._id}}}).exec(function(err, comments) {
                        res.locals.mentions = comments
                        async.forEachOf(comments, function(comment, key, cb2) {
                            for (i=0; i<comment.usersTagged.length; i++) {
                                if (req.user._id==comment.usersTagged[i].userID && !comment.usersTagged[i].read) {
                                    res.locals.unreadComments.push(comment)
                                }
                            }
                            cb2()

                        }, function() { // foreachof callback
                            cb()
                        })
                    })
                }
                else cb()
            },
            function(cb) { // find user collections
                if (req.user) {
                    var Collection = require('./models/wagoitem');
                    Collection.find({'_userId': req.user._id, type: "COLLECTION"}).exec(function(err, collections) {
                        req.user.collections = collections
                        cb()
                    })      
                }
                else cb()
            },
            function(cb) { // setup helpers
                res.locals.body = {id: "", theme: ""}

                if (req.user && req.user.config && req.user.config.theme)
                    res.locals.body.theme = req.user.config.theme

                if (req.user && req.user.account && !req.user.account.username)
                    req.user.account.username = ""

                res.locals.user = req.user;
                res.locals.site = {title: "WAGO", description: "Database of WeakAuras"}
                res.locals.pageinfo = res.locals.site

                // bb code parser
                res.locals.xbb = require('./xbbcode')

                res.locals.aura = {}
                res.locals.cache = {}
                var md5File = require('md5-file')

                async.parallel([
                    function(parallel_cb) {
                        res.locals["static"] = require('./static_vars');
                        parallel_cb()
                    },
                    function(parallel_cb) {
                        res.locals.category_menu = JSON.parse(fs.readFileSync('./static/categories.json', 'utf8'));
                        parallel_cb()
                    },
                    function(parallel_cb) {
                        res.locals.WagoOfTheMoment = JSON.parse(fs.readFileSync('./static/WagoOfTheMoment.json', 'utf8'));
                        parallel_cb()
                    },
                    function(parallel_cb) {
                        res.locals.cache.js = md5File.sync('./public/wago.js')
                        parallel_cb()
                    },
                    function(parallel_cb) {
                        res.locals.cache.css = md5File.sync('./public/wago.css')
                        parallel_cb()
                    }
                ],

                // parallel_cb()
                function(err) {
                    cb()
                })

            }

        ], function() {
            next()
        })
    },

    processImport: function(req, res, importWago, action, auraID) {
        if (importWago.string.length>112000 && !importWago.file) {
            var fs = require('fs')
            var file = "/tmp/wagoimport_"+Date.now()
            fs.writeFile(file, importWago.string.trim(), function(err) {
                if(err) {
                    req.flash('indexMsg', "Could not save file.")
                    res.redirect('/')
                }
                importWago.file = file

                return require('./wago_lib').processImport(req, res, importWago, action, auraID)
            })
        }
        else {
            var luafile, importString
            if (importWago.type=='WEAKAURAS2')
                luafile = './wa2json.lua'
            else if (importWago.type=='ELVUI')
                luafile = './elv2json.lua'
            else {
                console.error("INVALID IMPORT UNKNOWN ENCODING TYPE", importWago)
                req.flash('indexMsg', "Invalid string entered.")
                res.redirect('/')
            }

            if (importWago.file)
                importString = importWago.file
            else
                importString = importWago.string.trim()

            require('child_process').exec('luajit '+luafile+' "'+importString+'"', {cwd: '/home/mark/wago.io/lua', maxBuffer: 1024 * 1024 * 5}, function(err, strJSON) {
                strJSON = strJSON.replace(/(^"|"$)/g, '')
                if (err) {
                    console.error("INVALID IMPORT STRING1", err)
                    req.flash('indexMsg', "Invalid string entered.")
                    res.redirect('/')
                }
                else {
                    if (strJSON=='' || strJSON.indexOf("Error deserializing Supplied data is not AceSerializer data")>-1 || strJSON.indexOf("Unknown compression method")>-1) {
                        console.error("INVALID IMPORT STRING2", 'luajit '+luafile+' "'+importString+'"', strJSON)
                        req.flash('indexMsg', "Invalid string entered.")
                        res.redirect('/')
                    }
                    else {
                        // parse json
                        try {
                            objWago = JSON.parse(strJSON)
                        }
                        catch(e) {
                            var error = strJSON.replace(/(\.\/[^:]+):/, '')
                            console.error("INVALID IMPORT STRING3", error, strJSON)
                            req.flash('indexMsg', "Invalid string entered.")
                            res.redirect('/')
                            return
                        }

                        var _AuraCode = require('./models/aura-code');
                        var _WagoItem = require('./models/wagoitem');

                        // stuff going into database
                        var AuraCode = new _AuraCode();
                        AuraCode.encoded = importWago.string
                        AuraCode.json = strJSON

                        if ((action=='SAVE' || action=='REPLACE') && auraID) {
                            AuraCode.auraID = auraID
                            AuraCode.save(function(err, aura) {
                                if (err)
                                    throw err;

                                _WagoItem.findOneAndUpdate({ '_id': auraID }, { $set: {modified: Date.now(), "aura.code": AuraCode._id  }}, function(err, doc){
                                    if(err){ console.log("Something wrong when updating data!", err) }
                                })
                                if (action=='SAVE') {
                                    res.setHeader('Content-Type', 'application/json')
                                    res.send('{"wago":"'+AuraCode.auraID+'"}')
                                }
                                else
                                    res.redirect('/'+AuraCode.auraID)
                            })
                        }
                        else {
                            // verify data type
                            if (importWago.type=='WEAKAURAS2' && !objWago.v) {
                                console.error("INVALID WEAKAURAS2 IMPORT", objWago)
                                req.flash('indexMsg', "Invalid string entered.")
                                res.redirect('/')
                                return
                            }

                            var Wago = new _WagoItem();
                            Wago.aura.code = AuraCode._id

                            if (importWago.type=='WEAKAURAS2') {
                                Wago.name = objWago.d.id.trim()

                                if (!Wago.categories.length) {
                                    var autocats = require('./auto-categories')(objWago.d.load)
                                    if (autocats.length>0) {
                                        Wago.categories_auto = true
                                        Wago.categories = autocats
                                    }
                                }
                            }
                            else
                                Wago.name = "ElvUI Import"

                            Wago.type = importWago.type
                            if (req.body.auravisibility=="Hidden")
                                Wago.hidden = true
                            else
                                Wago.hidden = false

                            if (req.user) {
                                Wago._userId = req.user._id
                                if (req.body.auravisibility=="Private")
                                    Wago.private = true

                                if (req.body.anon=="Anonymous guest") {
                                    Wago.private = false
                                    Wago.hidden = false
                                    Wago._userId = null
                                }
                            }

                            if (req.body.beta!="Live" && require('./static_vars').beta_option) {
                                Wago.aura.wow_beta = true
                                Wago.categories = [require('./static_vars').beta_option.key]
                            }
                            else
                                Wago.aura.wow_beta = false

                            if (action=='CLONE' && auraID)
                                Wago.clone_of = auraID

                            if (req.body.expires && req.body.expires!="never") {
                                var expires = new Date()
                                switch (req.body.expires) {
                                    case '15 Minutes':
                                        expires.setTime(expires.getTime()+15*60*1000)
                                        break
                                    case '3 Hours':
                                        expires.setTime(expires.getTime()+3*60*60*1000)
                                        break
                                    case '1 Week':
                                        expires.setTime(expires.getTime()+7*24*60*60*1000)
                                        break
                                    case '1 Month':
                                        expires.setTime(expires.getTime()+30*24*60*60*1000)
                                        break
                                    case '3 Months':
                                        expires.setTime(expires.getTime()+6*30*24*60*60*1000)
                                        break
                                    default:
                                        expires = null
                                }
                                console.error('expires', req.body.expires, expires)
                                Wago.expires_at = expires
                            }

                            Wago.save(function(err) {
                                if (err)
                                    throw err;
                                AuraCode.auraID = Wago._id
                                AuraCode.save(function(err, aura) {
                                    if (err)
                                        throw err;
                                    if (action=='CLONE' || action=='APICREATE') {
                                        res.setHeader('Content-Type', 'application/json')
                                        res.send('{"wago":"'+AuraCode.auraID+'"}')
                                    }
                                    else
                                        res.redirect('/'+AuraCode.auraID)
                                })
                            })
                        }
                    }
                }
            })
        }
    }             
}

module.exports = wagofn
const Repository = require('../models/Repository');
const Response = require('../response');

module.exports =
    class BookmarksController extends require('./Controller') {
        constructor(req, res) {
            super(req, res);
            this.bookmarksRepository = new Repository('Bookmarks');
        }

        // GET: api/bookmarks
        // GET: api/bookmarks/{id}
        get(id) {
            let params = super.getQueryStringParams();
            console.log(params);
            var response;
            if (params != null && Object.keys(params).length == 0) {
                this.help();
            } else if (!isNaN(id)) {
                response = this.bookmarksRepository.get(id);
                this.response.JSON(response);
            } else {
                response = this.validFilter(params)
                if (response == '') {
                    let allBookmarks = this.bookmarksRepository.getAll();

                    //Name
                    if (params != null && "name" in params) {
                        allBookmarks = this.searchJSON(allBookmarks, params['name']);
                    }
                    //Category
                    if (params != null && "category" in params) {
                        allBookmarks = this.filterJSON(allBookmarks, params['category']);
                    }

                    //Sort
                    if (params != null && "sort" in params) {
                        allBookmarks = this.sortJSON(allBookmarks, params['sort'], true);
                    }

                    response = allBookmarks;
                } else {
                    this.response.badRequest();
                }
                this.response.JSON(response);
            }
        }

        // POST: api/bookmarks body payload[{"Id": 0, "Name": "...", "URL": "...", "Category": "..."}]
        post(bookmark) {
                let params = super.getQueryStringParams();
                if (this.verifyBookmark(bookmark)) {
                    let newBookmark = this.bookmarksRepository.add(bookmark);
                    if (newBookmark)
                        this.response.created(JSON.stringify(newBookmark));
                    else
                        this.response.internalError();
                } else {
                    this.response.internalError();
                }
            }
            // PUT: api/bookmarks body payload[{"Id":..., "Name": "...", "URL": "...", "Category": "..."}]
        put(bookmark) {
            console.log(super.getQueryStringParams());
            bookmark.Id = super.getQueryStringParams().Id;
            if (this.verifyBookmark(bookmark)) {
                if (this.bookmarksRepository.update(contact))
                    this.response.ok();
                else
                    this.response.notFound();
            } else
                this.response = "contact non valide";
        }

        verifyBookmark(bookmark) {
            if (bookmark.Id == "" || bookmark.Id == null)
                return false;
            if (bookmark.name = "" || bookmark.name == null)
                return false;
            if (bookmark.URL = "" || bookmark.URL == null)
                return false;
            if (bookmark.category = "" || bookmark.category == null)
                return false;
            this.bookmarksRepository.forEach((elem) => {
                if (elem.URL == bookmark.URL)
                    return false;
            })
            return true;
        }

        // DELETE: api/bookmarks/{id}
        remove(id) {
            if (!isNaN(id)) {
                if (this.bookmarksRepository.remove(id))
                    this.response.accepted();
                else
                    this.response.notFound();
            }
        }

        validFilter(params) {
            if (params != null) {
                let getExist = true;

                if (Object.keys(params).length > 3) {
                    return "Trop de paramètres";
                }
                //verify if a get in request doesn't exist
                Object.keys(params).forEach(elem => {
                    if (!(["name", "sort", "category"].includes(elem))) {
                        getExist = false;
                    }
                });
                if (!getExist) {
                    return "Un paramètre est invalide";
                }
                if ("sort" in params && !['id', "name", "url", "category"].includes(params['sort'].toLowerCase())) {
                    return "Vous ne pouvez pas triez avec un champ qui n'existe pas."
                }
            }
            return "";
        }
        help() {
            let content = "<div style=font-family:arial>";
            content += "<h3>GET : api/bookmarks endpoint  <br> List of possible query strings:</h3><hr>";
            content += "<h4>?name (use * afer word to search words that start with value) </h4>";
            content += "<h4>?sort sort by Id,Category,Name,URL</h4>";
            content += "<h4>?category filter by category</h4>";
            content += "<h3>GET : api/bookmarks/id endpoint</h3><hr>";
            content += "<h3>PUT : api/bookmarks endpoint  <br></h3><hr>";
            content += "<h4>?Id,Name,URL,Category need to be in the request</h4>";
            content += "<h3>POST : api/bookmarks endpoint  <br></h3><hr>";
            content += "<h4>?Name,URL,Category need to be in the request</h4>";
            content += "<h3>DELETE : api/bookmarks endpoint  <br></h3><hr>";
            content += "<h4>?id need to be in the request</h4>";
            this.res.writeHead(200, { 'content-type': 'text/html' });
            this.res.end(content) + "</div>";
        }
        filterJSON(arr, cat) {
            return arr.filter(function(i, n) {
                return i.Category.toLowerCase() == cat.toLowerCase();
            });
        }

        sortJSON(arr, key, asc) {
            return arr.sort(function(a, b) {
                var x = a[key];
                var y = b[key];
                if (asc) { return ((x < y) ? -1 : ((x > y) ? 1 : 0)); }
                if (!asc) { return ((x > y) ? -1 : ((x < y) ? 1 : 0)); }
            });
        }

        searchJSON(arr, val) {
            return arr.filter(function(a) {
                if (val.endsWith("*"))
                    return a.Name.toLowerCase().startsWith(val.slice(0, -1).toLowerCase()) != 0;
                else
                    return a.Name.toLowerCase().includes(val.toLowerCase()) != 0;
            });
        }
    }
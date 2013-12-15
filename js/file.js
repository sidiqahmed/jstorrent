function File(opts) {
    jstorrent.Item.apply(this, arguments)
    this.torrent = opts.torrent
    this.num = opts.num
    this.set('downloaded',0) // not zero! need to get our spanning pieces and add up the components...
    this.set('complete',0)

    if (this.torrent.multifile) {
        // should we prepend torrent name? Yes.
        var path = [this.torrent.get('name')].concat( this.torrent.infodict.files[this.num].path )
        this.path = path
        this.name = path[path.length-1]

        if (this.num == this.torrent.numFiles - 1) {
            this.size = this.torrent.size - this.torrent.fileOffsets[this.num]
        } else {
            this.size = this.torrent.fileOffsets[this.num+1] - this.torrent.fileOffsets[this.num]
        }
    } else {
        this.path = [this.torrent.infodict.name]
        this.name = this.torrent.infodict.name
        this.size = this.torrent.size
    }

}
jstorrent.File = File
File.prototype = {
    updatePercentComplete: function() {
        
    },
    get_key: function() {
        return this.num
    },
    getEntry: function(callback) {
        // gets file entry, recursively creating directories as needed...
        var filesystem = this.torrent.getStorage().entry
        var path = this.path.slice()

        function recurse(e) {
            if (path.length == 0) {
                if (e.isFile) {
                    callback(e)
                } else {
                    callback({error:'file exists'})
                }
            } else if (e.isDirectory) {
                if (path.length > 1) {
                    e.getDirectory(path.shift(), {create:true}, recurse, recurse)
                } else {
                    e.getFile(path.shift(), {create:true}, recurse, recurse)
                }
            } else {
                callback({error:'file exists'})
            }
        }
        recurse(filesystem)
    }
}
for (var method in jstorrent.Item.prototype) {
    jstorrent.File.prototype[method] = jstorrent.Item.prototype[method]
}
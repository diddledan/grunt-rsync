"use strict";

var rsync = require("rsyncwrapper").rsync;

module.exports = function (grunt) {

    grunt.task.registerMultiTask("rsync","Performs rsync tasks.",function () {

        var callback = function (error,stdout,stderr,cmd) {
            grunt.log.writeln("Shell command was: "+cmd);
            if ( error ) {
                 grunt.log.error();
                 grunt.log.writeln(error.toString().red);
                 done(false);
            } else {
                 grunt.log.ok();
                 done(true);
            }
        };

        var options = this.options();

        grunt.log.writelns("rsyncing "+options.src+" >>> "+options.dest);

        if ( !options.onStdout ) {
            options.onStdout = function (data) {
                grunt.log.write(data.toString("utf8"));
            };
        }

        if (options.copyExclusively) {
            var origSrc = options.src;
            var origDest = options.dest;
            var multidone = [];
            var that = this;

            var multiRsync = function() {
                multidone[i] = that.async();
                options.dest = dest;
                options.src = origSrc+'/'+options.copyExclusively[i];
                try {
                    rsync(options, function(error,stdout,stderr,cmd) {
                        multidone[i](callback(error,stdout,stderr,cmd));
                    });
                } catch (error) {
                    grunt.log.writeln("\n"+error.toString().red);
                    multidone[i](false);
                }
            };

            for (var i in options.copyExclusively) {
                var dest = origDest+'/'+options.copyExclusively[i];
                if (grunt.file.isDir(dest)) {
                    multiRsync();
                }
            }
        } else {
            try {
                var done = this.async();
                rsync(options, function(error,stdout,stderr,cmd) {
                    done(callback(error,stdout,stderr,cmd));
                });
            } catch (error) {
                grunt.log.writeln("\n"+error.toString().red);
                done(false);
            }
        }
    });
};

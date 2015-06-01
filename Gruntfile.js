var url = require( 'url' );
var path = require( 'path' );
var config = require( './config.json' );
var servers = Object.keys( config );
var gruntConfig = {};

module.exports = function ( grunt ) {
    // show elapsed time at the end
    require( 'time-grunt' )( grunt );
    // load all grunt tasks
    require( 'load-grunt-tasks' )( grunt );

    // grunt-contrib-jshint
    gruntConfig.jshint = {
        options: {
            jshintrc: '.jshintrc',
            reporter: require( 'jshint-stylish' )
        },
        all: servers.reduce( function ( list, server ) {
            list.push( path.join( __dirname, '/**/*.js' ) );
            return list;
        }, ['./*.js'])
    };
    servers.reduce( function ( jshint, server ) {
        jshint[server] = {
            files: {
                src: [path.join( __dirname, '/**/*.js' )]
            }
        };
        return jshint;
    }, gruntConfig.jshint );

    // grunt-express-server
    gruntConfig.express = {};
    servers.reduce( function ( express, server ) {
        express[server] = {
            options: {
                script: path.join( __dirname, config[server].src.main )
            }
        };
        return express;
    }, gruntConfig.express );

    // grunt-contrib-watch
    gruntConfig.watch = {};
    servers.reduce( function ( watch, server ) {
        watch[server] = {
            files: [
                path.join( __dirname, '/**/*.js' ),
				path.join( __dirname, '/assets/**/*.hbs' ),
                path.join( __dirname, 'config.json' )
            ],
            tasks: [
                'express:' + server
            ],
            options: {
                spawn: false,
                atBegin: true
            }
        };
        return watch;
    }, gruntConfig.watch );

    // grunt-open
  gruntConfig.open = {};
    servers.reduce( function ( open, server ) {
        open[server] = {
            path: url.format( config[server].url, config[server].open ),
            options: {
                delay: 1000
            }
        };
        return open;
    }, gruntConfig.open );

    // grunt-concurrent
    gruntConfig.concurrent = {
        all: {
            tasks:servers.map( function ( server ) {
                return 'serve:' + server;
            } ),
            options: {
                logConcurrentOutput: true
            }
        }
    };

    // init
    grunt.initConfig( gruntConfig );

    // custom tasks
    grunt.registerTask( 'serve', function ( server ) {
        var tasks = [];
        if ( config[server].open ) {
            tasks.push( 'open:' + server );
        }
        tasks.push( 'watch:' + server );
        return grunt.task.run( tasks );
    } );

    grunt.registerTask( 'validateConfig', function () {
        servers.reduce( function ( cache, server ) {
            var serverUrl = url.format( config[server].url );
            if ( cache[serverUrl] ) {
                grunt.fail.fatal( 'Duplicate server urls' );
            } else {
                cache[serverUrl] = true;
            }
            return cache;
        }, {} );
    } );

    // default task
	 grunt.registerTask( 'default', ['validateConfig', 'concurrent:all'] );

};

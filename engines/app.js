requirejs.config({
    baseUrl: 'engines/lib',
    paths: {
        app: '../app'
    }
});

requirejs(['app/main']);
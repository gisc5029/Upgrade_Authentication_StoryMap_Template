if (document.location.protocol == "file:") {
    $(document).ready(function () {
        $("#fatalError .error-title").html("Application loading failed");
        $("#fatalError .error-msg").html("The application has to be accessed through a web server. Consult user guide for detail.");
        $("#fatalError").show();
    });
} else {
    var i18n = null;
    define.amd.jQuery = true;
    require([
        "esri/IdentityManager"
    ], function (
        IdentityManager
    ) {
        if (window.self === window.top) {
            var checkSelfUrl = 'https://gistdaportal.gistda.or.th/portal/sharing/rest/oauth2/platformSelf';
            var req = new XMLHttpRequest();
            req.responseType = 'json';
            req.open('POST', checkSelfUrl, true);
            req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            req.setRequestHeader('X-Esri-Auth-Client-Id', 'arcgisonline');
            req.setRequestHeader('X-Esri-Auth-Redirect-Uri', 'https://gistdaportal.gistda.or.th/portal/home/');
            req.onload = () => {
                var jsonResponse = req.response;
                if (jsonResponse && jsonResponse.token) {
                    var currentTimestamp = new Date().getTime();
                    var tokenExpiresTimestamp = currentTimestamp + (jsonResponse.expires_in * 1000);
                    var cred = {
                        "userId": jsonResponse.username,
                        "server": "https://gistdaportal.gistda.or.th/portal",
                        "token": jsonResponse.token,
                        "expires": tokenExpiresTimestamp,
                        "ssl": true
                    };
                    window.savedCred = {
                        credential: cred
                    }
                    IdentityManager.registerToken(cred);
                    defaultBehavior();
                } else defaultBehavior();
            };
            req.onerror = () => {
                defaultBehavior();
            }
            var params = 'f=json';
            req.send(params);
        } else defaultBehavior();
    });
}

function defaultBehavior() {
    console.log('defaultBehavior')
    require([
        "dojo/i18n!./resources/tpl/viewer/nls/template.js?v=" + app.version,
        "esri/urlUtils",
        "dojo/dom",
        "app/custom-scripts",
        "dojo/ready"
    ], function (
        i18nViewer,
        urlUtils,
        dom,
    ) {
        i18n = i18nViewer;

        require([
            "lib-app/jquery",
            "storymaps/common/Core",
            "storymaps/tpl/core/MainView"
        ], function (
            jQuery,
            Core,
            MainView
        ) {
            if (app.isInBuilder) {
                require([
                    "storymaps/common/builder/Builder",
                    "storymaps/tpl/builder/BuilderView",
                    "dojo/i18n!./resources/tpl/builder/nls/template.js?v=" + app.version,
                    "dojo/i18n!commonResources/nls/core.js?v=" + app.version,
                    "dojo/i18n!commonResources/nls/media.js?v=" + app.version,
                    "dojo/i18n!commonResources/nls/webmap.js?v=" + app.version,
                    "dojo/i18n!commonResources/nls/mapcontrols.js?v=" + app.version,
                    "dojo/_base/lang"
                ], function (
                    Builder,
                    BuilderView,
                    i18nBuilder,
                    i18nCommonBuilder,
                    i18nCommonMedia,
                    i18nCommonWebmap,
                    i18nCommonMapControls,
                    lang
                ) {
                    lang.mixin(i18n, i18nBuilder);
                    lang.mixin(i18n, i18nCommonBuilder);
                    lang.mixin(i18n, i18nCommonMedia);
                    lang.mixin(i18n, i18nCommonWebmap);
                    lang.mixin(i18n, i18nCommonMapControls);

                    var builderView = new BuilderView(Core),
                        mainView = new MainView(builderView);

                    Core.init(mainView, Builder);
                    Builder.init(Core, builderView);
                });
            } else {
                Core.init(new MainView());
            }
        });
    });
}
// this code handles navigation from a secondary pin. It will need to defer navigation until the webview is created by the ManifoldCordova plugin.
WinJS.Application.addEventListener("activated", function (e) {
    if (e.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.launch) {
        if (e.detail.arguments !== "") {
            var secondaryPinLocation = e.detail.arguments;

            // defer navigation until deviceready
            document.addEventListener("deviceready", function () {
                document.getElementById("main-view").navigate(secondaryPinLocation);
            })
        }
    }

}, false);

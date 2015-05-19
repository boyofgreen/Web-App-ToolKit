
"use strict";

var WAT, tileConfig;
var logger = window.console;
var setupLiveTile, setupTileFeed, checkSiteforMetaData, processLiveTileMetaTags;

var self = {
  // These match the values in Windows.UI.Notifications.PeriodicUpdateRecurrence
  periodicUpdateRecurrence: [30, 60, 360, 720, 1440],

  init: function (WATRef) {

    if (!WAT) {
      WAT = WATRef;
    }

    tileConfig = (WAT.manifest.wat_liveTiles || {});
    setupLiveTile();
  }
};

setupLiveTile = function () {
    if (!tileConfig || tileConfig.enabled !== true) {
        return;
    }

    tileConfig.enableQueue = !!tileConfig.enableQueue;

    // Enable Notifications Queue - The tile will cycle through the multple tile notifications
    var notifications = Windows.UI.Notifications;
    notifications.TileUpdateManager.createTileUpdaterForApplication().enableNotificationQueue(tileConfig.enableQueue);

    if (tileConfig.tilePollFeed) {
        // Did they give us a feed to poll?

        setupTileFeed(tileConfig.tilePollFeed);

    } else {
        // If they didn't give us a specific feed, we'll see if the loaded
        // webview has any live tile meta tags
        WAT.components.webView.addEventListener("MSWebViewDOMContentLoaded", checkSiteforMetaData);
    }
};

checkSiteforMetaData = function () {
    var scriptString, exec;

    logger.log("looking for meta tags in webview...");

    WAT.components.webView.addEventListener("MSWebViewScriptNotify", processLiveTileMetaTags);

    scriptString = "var meta = document.querySelector('meta[name=msapplication-notification]');" +
                   "if (meta) { window.external.notify('TILEMETA~~' + meta.content); }";

    exec = WAT.components.webView.invokeScriptAsync("eval", scriptString);
    exec.start();

    WAT.components.webView.removeEventListener("MSWebViewDOMContentLoaded", checkSiteforMetaData);

    /*
    META TAG EXAMPLE

    <meta name="application-name" content="Foobar"/>
    <meta name="msapplication-TileColor" content="#8f398f"/>
    <meta name="msapplication-square70x70logo" content="tiny.png"/>
    <meta name="msapplication-square150x150logo" content="square.png"/>
    <meta name="msapplication-wide310x150logo" content="wide.png"/>
    <meta name="msapplication-square310x310logo" content="large.png"/>
    <meta name="msapplication-notification" content="frequency=30;polling-uri=http://notifications.buildmypinnedsite.com/?feed=http://www.npr.org/rss/rss.php?id=1001&amp;id=1;polling-uri2=http://notifications.buildmypinnedsite.com/?feed=http://www.npr.org/rss/rss.php?id=1001&amp;id=2;polling-uri3=http://notifications.buildmypinnedsite.com/?feed=http://www.npr.org/rss/rss.php?id=1001&amp;id=3;polling-uri4=http://notifications.buildmypinnedsite.com/?feed=http://www.npr.org/rss/rss.php?id=1001&amp;id=4;polling-uri5=http://notifications.buildmypinnedsite.com/?feed=http://www.npr.org/rss/rss.php?id=1001&amp;id=5; cycle=1"/>

    -OR-
    <meta name="application-name" content="Foobar"/>
    plus "browserconfig.xml":
    <browserconfig>
        <msapplication>
            <tile>
                <square70x70logo src="tiny.png"/>
                <square150x150logo src="square.png"/>
                <wide310x150logo src="wide.png"/>
                <square310x310logo src="large.png"/>
                <TileColor>#8f398f</TileColor>
            </tile>
            <notification>
                <polling-uri src="http://notifications.buildmypinnedsite.com/?feed=http://www.npr.org/rss/rss.php?id=1001&id=1"/>
                <polling-uri2 src="http://notifications.buildmypinnedsite.com/?feed=http://www.npr.org/rss/rss.php?id=1001&id=2"/>
                <polling-uri3 src="http://notifications.buildmypinnedsite.com/?feed=http://www.npr.org/rss/rss.php?id=1001&id=3"/>
                <polling-uri4 src="http://notifications.buildmypinnedsite.com/?feed=http://www.npr.org/rss/rss.php?id=1001&id=4"/>
                <polling-uri5 src="http://notifications.buildmypinnedsite.com/?feed=http://www.npr.org/rss/rss.php?id=1001&id=5"/>
                <frequency>30</frequency>
                <cycle>1</cycle>
            </notification>
        </msapplication>
    </browserconfig>
    */
};

processLiveTileMetaTags = function (e) {
    var content, feedURL, recurrence;

    content = e.value.split(/~~/);
    if (content.length !== 2 || content[0] !== "TILEMETA") {
        // oops, this isn't ours
        return;
    }

    logger.log("captured script notify event for livetile polling feed: ", e.value);

    content = content[1].split(/;/);
    content.forEach(function (value) {
        var option = value.split(/=/);
        if (option[0] === "polling-uri") {
            feedURL = option[1];
        } else if (option[0] === "frequency" && tileConfig.periodicUpdate === undefined) {
            tileConfig.periodicUpdate = Math.max(0, self.periodicUpdateRecurrence.indexOf(option[1]));
        }
    });

    WAT.components.webView.removeEventListener("MSWebViewScriptNotify", processLiveTileMetaTags);

    setupTileFeed(feedURL);
};

setupTileFeed = function (feedURL) {
    var n, updater, address, urisToPoll,
        recurrence = Windows.UI.Notifications.PeriodicUpdateRecurrence.halfHour;

    if (feedURL.splice) {
        // we already have an array of feeds, use it!
        urisToPoll = feedURL;

    } else {
        urisToPoll = [];

        for (n = 0; n < 5; ++n) {
         //   address = "http://discourse.azurewebsites.net/FeedTile.ashx?index=" +
          //            String(n) +
            //           "&url=" + encodeURIComponent(feedURL);
            address = 'http://notifications.buildmypinnedsite.com/?feed=' + encodeURIComponent(feedURL) + '&id=' + n.toString();
            try {
                urisToPoll.push(new Windows.Foundation.Uri(address));
            } catch (err) {
                // broken address, never mind
                logger.warn("Unable to load live tile feed URL: " + feedURL, err);
                return;
            }
        }
    }

    try {
        updater = Windows.UI.Notifications.TileUpdateManager.createTileUpdaterForApplication();
        updater.clear();
        updater.stopPeriodicUpdate();

        if (tileConfig.periodicUpdate !== undefined) {
            recurrence = tileConfig.periodicUpdate;
        }

        updater.startPeriodicUpdateBatch(urisToPoll, recurrence);

    } catch (e) {
        // Tile APIs are flaky.. they sometimes fail for no readily apparent reason
        // but that's no reason to crash and risk a 1-star
        logger.warn("Error setting up live tile", e);
    }
};

module.exports = self;

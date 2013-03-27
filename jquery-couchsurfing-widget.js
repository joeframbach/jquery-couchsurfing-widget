$(function () {
    $('head').append('<style type="text/css">'
    +'.couchsurfing-widget{background-color:#eee;position:relative;border:1px solid #ddd;color:#666;border-radius:3px;font-family:"Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif}'
    +'.couchsurfing-widget a .link{position:absolute;width:100%;height:100%;top:0;left:0;z-index:2}'
    +'.couchsurfing-widget .top{color:#D4490B;font-size:24px;height:64px;line-height:64px;padding-left:125px;vertical-align:middle;border-bottom:1px solid #ccc}'
    +'.couchsurfing-widget .top img{vertical-align:middle;padding:4px}'
    +'.couchsurfing-widget .middle{padding-left:125px;background:#F8F7F3;vertical-align:middle;height:48px;line-height:48px;font-size:16px}'
    +'.couchsurfing-widget .middle img{vertical-align:middle;padding-right:8px}'
    +'.couchsurfing-widget .circular{position:absolute;top:8px;left:8px;width:100px;height:100px;background-size:cover;border-radius:50%;-webkit-border-radius:50%;-moz-border-radius:50%;box-shadow:0 0 10px rgba(0,0,0,.9);-webkit-box-shadow:0 0 10px rgba(0,0,0,.9);-moz-box-shadow:0 0 10px rgba(0,0,0,.9)}'
    +'</style>');
    var load_profile = function (username, next, err) {
        // use YQL to bypass CORS, and jquery to traverse page
        err = err || function(){};
        var parse_html = function (html) {
            // Don't load all the assets immediately
            html = html.replace(/ src=/gm, ' data-src=');
            var $html = $(html);
            $.each($html.find('[data-src^="/"]'), function(i,e) {
                $(e).data('src', 'http://www.couchsurfing.org'+$(e).data('src'));
            });
            // only load image assets
            $.each($html.find('img'), function(i,e) {
                $(e).attr('src', $(e).data('src'));
            });
            // look for data only if the profile h1 exists
            return ($html.find('h1.profile').length) && {
                username: $html.find("th.generalinfo:contains('membername')").next('td').find('p').text(),
                realname: $html.find('h1.profile').html(),
                image: $html.find("a[href^='/image_gallery'] img").data('src'),
                is_identity_checked: $html.find('.verification_information img[data-src$="/images/verification/verified-icon-lg.png"]'),
                is_location_verified: $html.find('.verification_information img[data-src$="/images/place.png"]'),
                couch_status: $html.find('table.profile_header tr:eq(2) td:eq(0) .iconbox img[data-src*=couch]'),
                designations: (function () {
                    var $imgs = $html.find('table.profile_header tr:eq(2) td:eq(0) .iconbox img');
                    var designations = {};
                    $imgs.each(function () {
                        designations[$(this).attr('title')] = $(this).data('src');
                    });
                    return designations;
                }()),
                ref_sum: (function () {
                    var $tags = $html.find('div#ref_sum .filter_tag');
                    var ref_sum = {};
                    $tags.each(function () {
                        ref_sum[$(this).find('.label').text()] = $(this).find('.num').text();
                    });
                    return ref_sum;
                }())
            };
        };
        $.getJSON("http://query.yahooapis.com/v1/public/yql?" +
            "q=select%20*%20from%20html%20where%20url%3D%22" + encodeURIComponent('http://www.couchsurfing.org/users/'+username) +
            "%22&format=xml'&callback=?",
            function (data) {
                if (data.results[0]) {
                    profile = parse_html(data.results[0]);
                    profile || err(username + ' has chosen to show their profile only to members.');
                    profile && next(profile);
                } else {
                    err('Couchsurfing profile not loaded.');
                }
            }
        );
    };

    var cslogo = "data:image/gif;base64,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";

    $('.couchsurfing-widget').each(function () {
        var username = $(this).data('username');
        // show the skeleton, then async-load the rest of the profile
        var $widget = $(this).append(
            '<a href="http://www.couchsurfing.org/users/'+username+'"><span class="link"></span></a>'
            +'<div class="circular"></div>'
            +'<div class="top">'+username+' <img src="'+cslogo+'" /></div>'
            +'<div class="middle"></div>'
        );
        load_profile(username, function (profile) {
            $widget.find('div.circular').css('background-image','url('+profile.image+')');
            $widget.find('.middle').append(profile.couch_status).append(profile.couch_status.attr('title'));
            $widget.find('.middle').append(' &ndash; ' + profile.ref_sum['Positive'] + ' positive and ' + profile.ref_sum['Negative'] + ' negative reviews');
        }, function(err) {
            $widget.find('.middle').text(err);
        });
    });
});
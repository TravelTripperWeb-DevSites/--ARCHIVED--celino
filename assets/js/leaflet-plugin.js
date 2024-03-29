// Leaflet Interactive Map Plugin

(function ($) {
  $.fn.leafletMap = function (options) {
    var self     = this;
    var defaults = {
      hotelTitle      : 'The Celino Hotel',
      hotelAddress    : '640 Ocean Dr, Miami Beach, FL 33139, USA',
      hotelLat        : 40.719892,
      hotelLong       : -74.000173,
      hotelMarker     : '/assets/images/map-marker.png',
      markerSize      : [36, 46],
      zoom            : 15,
      minZoom         : 0,
      maxZoom         : 18,
      fitBounds       : true,
      attrIconClass   : 'map-circle-icon',
      attrLabel       : false,
      showPopup       : true,
      markerLabelText : false,
      categorytypeIcon: false,
      scrollWheelZoom : false,
      scrollOnClick   : true,
      getDirectionBtn : false,
      googleLink      : false,
      websiteLink     : false,
      getDirectionBtnLabel  : 'Get Directions',
      hideMarkerLabelHover  : true,
      markerClickAction     : false,
      TileStyle             : 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      attribution           : 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      attractionsList : null
    },

    options                       = $.extend(defaults, options);
    var mapID                     = self.attr('id'); //map element id
    var attractionsArray          = options.attractionsList;
    var formattedAttractionsList  = [];
    var attractionsfilter         = {};

    // Set hotel marker icon
    var hotelIcon = L.icon({
      iconUrl: options.hotelMarker,
      iconSize: options.markerSize
    });

    if (mapID) {
      var map = L.map(mapID, {
        scrollWheelZoom: options.scrollWheelZoom
      });
      map.setView([options.hotelLat, options.hotelLong], options.zoom);
      L.tileLayer(options.TileStyle, {
        attribution: options.attribution,
        minZoom    : options.minZoom,
        maxZoom    : options.maxZoom
      }).addTo(map);

      // Enable scrolling on map after clicking
      map.addEventListener("dblclick", function () {
        if(!options.scrollWheelZoom && options.scrollOnClick) {
          if (map.scrollWheelZoom.enabled()) { // if scroll is already enabled then clicking should disable it
            map.scrollWheelZoom.disable();
          } else {
            map.scrollWheelZoom.enable();
          }
        }
      });

      // Set hotel marker
      var marker = L.marker([options.hotelLat, options.hotelLong], {
        title: options.hotelTitle,
        alt  : 'Hotel Map Marker',
        icon : hotelIcon
      }).bindPopup('<h4>' + options.hotelTitle + '</h4>' + options.hotelAddress).addTo(map);

      if($(self).data("attractions") == 'show') {
        loadAttractionMarkers();
        setCategoriesFilter();
        showAttractionsHTMLList();
      }
    }

    // Set attraction markers
    function attractionMarkersIcon($value, $category) {
      var attractionIcon;
      var iconObj = {
        className: $category + options.attrIconClass
      };

      if(options.attrLabel) {
        iconObj = $.extend(iconObj, {
          html: $value
        });
      }
      attractionIcon = L.divIcon(iconObj);
      return attractionIcon;
    }

    function loadAttractionMarkers() {
      for (var i = 0; i < attractionsArray.length; i++) {
        var infoText ='';


        var category  = attractionsArray[i][3];
        var iconClass = options.categorytypeIcon ? attractionsArray[i][3] : '';
        var iconLabel = options.markerLabelText ? attractionsArray[i][0] : i + 1;

        attractionsfilter[category] = attractionsfilter[category] || [];

        marker = new L.marker([attractionsArray[i][1], attractionsArray[i][2]], {
          title       : options.hideMarkerLabelHover ? '' : attractionsArray[i][0],
          attractionTitle: attractionsArray[i][0],
          alt         : attractionsArray[i][3],
          marker_item : i+1,
          icon        : attractionMarkersIcon(iconLabel, iconClass),
          riseOnHover : true
        });

        if(options.showPopup) {
          if (options.googleLink) {
            infoText = '<a href="http://maps.google.com/maps?q='+attractionsArray[i][0]+'+'+ attractionsArray[i][4]+'" target="_blank"><h4>' + attractionsArray[i][0] + '</h4>' + attractionsArray[i][4]+ '</a>';
          }else if(!options.websiteLink && options.getDirectionBtn) {
            infoText = '<img src="'+attractionsArray[i][6]+'" alt="' + attractionsArray[i][0] + '"><h4>' + attractionsArray[i][0] + '</h4> <a rel="nofollow" href="http://maps.google.com/maps/dir/The+Celino+Hotel,+Ocean+Drive,+Miami+Beach,+FL,+USA/'+ encodeURIComponent(attractionsArray[i][0]).replace(/ /g,'+')+'+'+ encodeURIComponent(attractionsArray[i][4]).replace(/ /g,'+')+'" class="button" target="_blank">'+options.getDirectionBtnLabel+'</a>';
          }else if( options.websiteLink && !options.getDirectionBtn) {
            infoText = '<h4><a rel="nofollow" target="_blank" href="'+attractionsArray[i][5]+'">' + attractionsArray[i][0] + '</a></h4> <a rel="nofollow" target="_blank" href="'+attractionsArray[i][5]+'" class="link">Get Directions</a>';
          }
          else if( options.websiteLink && options.getDirectionBtn) {
          infoText = '<img src="'+attractionsArray[i][6]+'" alt="' + attractionsArray[i][0] + '"><h4><a rel="nofollow" target="_blank" href="'+attractionsArray[i][5]+'">' + attractionsArray[i][0] + '</a></h4>' + attractionsArray[i][4]+ ' <br><a href="http://maps.google.com/maps/dir/The+Celino+Hotel,+Ocean+Drive,+Miami+Beach,+FL,+USA/'+ encodeURIComponent(attractionsArray[i][0]).replace(/ /g,'+')+'+'+ encodeURIComponent(attractionsArray[i][4]).replace(/ /g,'+')+'" class="button" target="_blank">'+options.getDirectionBtnLabel+'</a>';
          }
          else {
            infoText = '<h4>' + attractionsArray[i][0] + '</h4>' + attractionsArray[i][4];
          }
          marker = marker.bindPopup(infoText);
        }
        marker.addTo(map);

        // Add custom action on click of Marker defined as per site's requirement
        if(options.markerClickAction && options.markerClickAction instanceof Function) {
          marker.on('click', options.markerClickAction);
        }else{
          marker.on('click', function(e){
            $('.leaflet-marker-icon').removeClass('active');
            map.panTo(this.getLatLng());
            console.dir(this);
            $(this._icon).addClass('active');
          });
        }

        var attractionObj = {
          lat     : attractionsArray[i][1],
          lon     : attractionsArray[i][2],
          marker  : marker,
          li      : self,
          category: attractionsArray[i][3]
        };

        formattedAttractionsList.push(attractionObj);
        attractionsfilter[category].push(attractionObj);
      }
    }

    function setCategoriesFilter() {
      var categories             = Object.keys(attractionsfilter);
      var mapcategoryFilterEle   = $("[data-mapcategory-filter]");

      // Add filter
      if (categories.length > 1) {
        // Setup tabs
        if (mapcategoryFilterEle) {
          // First add 'All' option
          mapcategoryFilterEle.append(
            "<li class=\"nav-item\"><a class=\"nav-link active\" data-category='all'>All</a></li>"
          );
          // Now add all categories
          for (var i = 0, ii = categories.length; i < ii; i++) {
            mapcategoryFilterEle.append(
              "<li class=\"nav-item " + $.trim(categories[i]).toLowerCase() + "\"><a class=\"nav-link\" data-category=\"" + categories[i] + "\">" + categories[i] + "</a></li>"
            );
          }
        }
      }

      // Define category filter behaviour

      $("[data-category]").click(function () {
        var bound = []; // Set autofit bound
        var selectedCategory = $(this).data('category');
        $(this).parent('li').siblings().find('a').removeClass('active');
        $(this).addClass('active');
        // Show/hide attractions from html list
        if (selectedCategory != "all") {
          $('[data-mappable-category]').hide();
          $('[data-mappable-category="' + selectedCategory + '"]').show();
        } else {
          $('[data-mappable-category]').show();
        }

        // Show/hide markers based on selected attractions category or 'All'
        for (var i = 0; i < formattedAttractionsList.length; i++) {
          if (formattedAttractionsList[i].category == selectedCategory || selectedCategory == "all") {
            formattedAttractionsList[i].marker.addTo(map);
            bound.push([formattedAttractionsList[i].lat, formattedAttractionsList[i].lon]);
          } else {
            map.removeLayer(formattedAttractionsList[i].marker);
          }
        }

        // Category based fit bounds map
        setTimeout(function(){
          if (options.fitBounds) {
            map.fitBounds(bound);
          }
        },500);
      });
    }

    function showAttractionsHTMLList() {
      var mapcategoryFilterEle   = $("[data-mapcategory-filter]");
      var mapCategoryHtmlListEle = $("[data-mapcategory-list]");

      // Show all attractions
      if (mapCategoryHtmlListEle) {
        // Add attractions items
        $.each(attractionsfilter, function (key1, value1) {
          mapCategoryHtmlListEle.append('<div data-mappable-category="' + key1 + '"><h3>' + key1 + '</h3><ul class="attraction-lists list-' + key1 + '"></ul></div>');
          for (var i = 0; i < value1.length; i++) {

            $('ul.list-' + key1).append('<li data-mappable-item="' + i + '" data-mappable-category="' + value1[i].category + '">' + value1[i].marker.options.attractionTitle + '</li>');
          };
        });

        // Define each attractions 'on hover' and 'on click' behaviour
        $("[data-mappable-item]").each(function () {
          var categoryitem = $(this).data('mappable-category');
          var itemID       = $(this).data('mappable-item');

          // 'On hover' highlight selected attraction's marker
          $(this).hover(function () {
            $(attractionsfilter[categoryitem][itemID].marker._icon).addClass('active');
          }, function () {
            $(attractionsfilter[categoryitem][itemID].marker._icon).removeClass('active');
          });

          // 'On click' show selected attraction's popup if enabled and show active Category name in filter tab
          $(this).click(function (event) {
            $.each(attractionsfilter[categoryitem], function(i, item){
              $(item.marker._icon).removeClass('active');
            });
            setTimeout(function(){
              if (options.fitBounds) {
                map.fitBounds([$(attractionsfilter[categoryitem][itemID].marker.getLatLng())]);
              }
              $(attractionsfilter[categoryitem][itemID].marker._icon).addClass('active');
            }, 400);

            if (options.showPopup) { 
              var mlat = $(attractionsfilter[categoryitem][itemID].marker._latlng.lat);
              var mlng = $(attractionsfilter[categoryitem][itemID].marker._latlng.lng);
              mlat.push.apply(mlat, mlng);

              map.panTo({
                lat: mlat[0],
                lng: mlat[1]
              });
              attractionsfilter[categoryitem][itemID].marker.openPopup();
            }
          });

        });
      }
    }
  };

})(jQuery);

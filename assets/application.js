var Application = {

  ModelTracking : {

    smokeListStorageName : 'smoke_list',
    smokesList : {

    },

    isCurrentlySmoking      : 0,
    todayDate               : '',
    todayCount              : 0,
    todayFirstCigaretteTime : 0,
    todayLastCigaretteTime  : 0,

    Init : function() {
      this._setStorageMethods();
      this._setTodayDate();
      this._syncDataFromStorage();

      if(typeof this.smokesList[this.todayDate] == "undefined")
        this.smokesList[this.todayDate] = [];

      this._calculateTodayInformation();
    },

    _setStorageMethods : function() {
      Storage.prototype.setObject = function(key, value) {
        this.setItem(key, JSON.stringify(value));
      };

      Storage.prototype.getObject = function(key) {
        var value = this.getItem(key);
        return value && JSON.parse(value);
      };
    },

    insertSmokeRecord : function() {
      this.smokesList[this.todayDate][this.smokesList[this.todayDate].length] = this.getCurrentTime();

      this._syncDataToStorage();
      this._calculateTodayInformation();
    },

    _calculateTodayInformation : function() {
      var todaySmokeList = this.smokesList[this.todayDate]

      this.todayCount = todaySmokeList.length;

      if(todaySmokeList.length != 0) {
        this.isCurrentlySmoking
            = (todaySmokeList[todaySmokeList.length - 1] == this.getCurrentTime());

        this.todayFirstCigaretteTime = todaySmokeList[0];
        this.todayLastCigaretteTime  = todaySmokeList[todaySmokeList.length - 1];
      }
    },

    _setTodayDate : function() {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!
      var yyyy = today.getFullYear();

      if(dd<10) {
        dd='0'+dd
      }

      if(mm<10) {
        mm='0'+mm
      }

      this.todayDate = dd + '/' + mm +'/'+yyyy;
    },

    getCurrentTime : function() {
      var today  = new Date();
      var minute = today.getMinutes();
      var hour  = today.getHours();

      if(minute < 10) {
        minute = '0'+minute
      }

      if(hour < 10) {
        hour = '0' + hour
      }

      return hour + ':' + minute;
    },

    _syncDataFromStorage : function() {
      this.smokesList = localStorage.getObject(this.smokeListStorageName);

      if(this.smokesList == null)
        this.smokesList = {};
    },

    _syncDataToStorage : function() {
      localStorage.setObject(this.smokeListStorageName, this.smokesList);
    }

  },

  ViewHelper : {

    containerObject : {},
    viewAttribute  : 'data-view',
    viewIdentifier : '[data-view]',
    viewDisplayAttribute  : 'data-view-display',
    viewDisplayIdentifier : '[data-view-display]',

    Init : function(containerObject) {
      this.containerObject = containerObject;

      this.containerObject.find(this.viewIdentifier).hide();
      this.BindViewDisplayActions();
      this.DisplayView(0);
    },

    BindViewDisplayActions : function() {
      var objectInstance = this;

      this.containerObject.find(this.viewDisplayIdentifier).bind('click', function(){
        objectInstance.DisplayView(jQuery(this).attr(objectInstance.viewDisplayAttribute));
      });
    },

    DisplayView : function(index) {
      var objectInstance = this;

      this.containerObject.find(this.viewIdentifier).each(function(){
        if(jQuery(this).index() == index)
          jQuery(this).show();
        else
          jQuery(this).hide();
      });

      this.containerObject.find(this.viewDisplayIdentifier).each(function(){
        if(jQuery(this).attr(objectInstance.viewDisplayAttribute) == index)
          jQuery(this).addClass('active');
        else
          jQuery(this).removeClass('active');
      });
    }


  },

  containerObject : {},

  _triggerIdentifierSmokeCigarette : '[data-trigger-cigarettes-smoke]',
  _informationIdentifierCigarettesSmokedTodayContainer : '[data-information-cigarettes-today-container]',
  _informationIdentifierCigarettesSmokedToday          : '[data-information-cigarettes-today]',
  _informationIdentifierCigarettesSmokedTodayFirstTime : '[data-information-cigarettes-today-first-time]',
  _informationIdentifierCigarettesSmokedTodayLastTime  : '[data-information-cigarettes-today-last-time]',
  _informationIdentifierCigarettesStatistics           : '[data-information-cigarettes-statistics]',
  _displayIdentifierCigarettesSmokedToday              : '[data-information-cigarettes-today-has]',

  Init : function() {
    this.containerObject = jQuery('body');
    this.ModelTracking.Init();
    this.ViewHelper.Init(this.containerObject);

    this._refreshInformation();
    this._setActionTriggers();
    this._setSync();
  },

  _setActionTriggers : function() {
    var objectInstance = this;

    this.containerObject
        .find(this._triggerIdentifierSmokeCigarette)
        .bind('click', function(){
          if(objectInstance.ModelTracking.isCurrentlySmoking == 0) {
            objectInstance.ModelTracking.insertSmokeRecord();
            objectInstance._refreshInformation();
          }
        });
  },

  _refreshInformation : function() {
    var objectInstance = this;

    if(this.ModelTracking.todayCount == 0) {
      this.containerObject
          .find(this._displayIdentifierCigarettesSmokedToday)
          .hide();
    } else {
      this.containerObject
          .find(this._displayIdentifierCigarettesSmokedToday)
          .fadeIn('slow');
    }

    this.containerObject
        .find(this._informationIdentifierCigarettesSmokedToday)
        .html(this.ModelTracking.todayCount);
    this.containerObject
        .find(this._informationIdentifierCigarettesSmokedTodayFirstTime)
        .html(this.ModelTracking.todayFirstCigaretteTime);
    this.containerObject
        .find(this._informationIdentifierCigarettesSmokedTodayLastTime)
        .html(this.ModelTracking.todayLastCigaretteTime);
    this.containerObject
        .find(this._triggerIdentifierSmokeCigarette)
        .each(function(){
          if(objectInstance.ModelTracking.isCurrentlySmoking == 0) {
            jQuery(this).removeClass('btn-enjoy-cigarette btn-disabled');
            jQuery(this).addClass('btn-smoke-cigarette');
            jQuery(this).html('Take a smoke');
          } else {
            jQuery(this).removeClass('btn-smoke-cigarette');
            jQuery(this).addClass('btn-enjoy-cigarette btn-disabled');
            jQuery(this).html('Enjoy your cigarette');
          }
        });

    this.containerObject
        .find(this._informationIdentifierCigarettesStatistics)
        .each(function(){
          jQuery(this)
              .html(objectInstance._getCigarettesStatisticsHTML());
        });
  },

  _getCigarettesStatisticsHTML : function() {
    var displayedDays = 0,
        html = '';

    jQuery.each(this.ModelTracking.smokesList, function(date, information) {
      if(information.length > 0) {
        displayedDays++;

        html += '<div class="smoke-stats-container smoke-stats-row">';
        html +=  '<table class="custom">';
        html +=    '<tr>';
        html +=      '<td class="text-left"> Date </td>';
        html +=      '<td class="text-left">: <span class="highlight">' + date + '</span></td>';
        html +=    '</tr>';
        html +=    '<tr>';
        html +=      '<td class="text-left"> Cigarettes </td>';
        html +=      '<td class="text-left">: <span class="highlight">' + information.length + '</span></td>';
        html +=    '</tr>';
        html +=    '<tr>';
        html +=      '<td class="text-left"> Last Smoked </td>';
        html +=      '<td class="text-left">: <span class="highlight">' + information[information.length - 1] + '</span></td>';
        html +=    '</tr>';
        html +=  '</table>';
        html += '</div>';
      }
    });

    return (displayedDays == 0) ? '<p class="text-center">No statistics to display, yet</p>' : html;
  },

  _setSync : function() {
    var objectInstance = this;

    setInterval(function(){
      objectInstance.ModelTracking._calculateTodayInformation();
      objectInstance._refreshInformation();
    }, 60000);
  }

};
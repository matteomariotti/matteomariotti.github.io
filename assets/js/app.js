var MM = MM || {};

MM.interface = (function($, undefined){

  // Default values
  var _defaults = {
    projectsGridColumnWidth : 140,
    projectsGridGutterWidth : 20,
    projectItemsWidth: 840
  };

  var _firstload = true;

  var _isProjectDetailOpened = function() {
    return $('.detail-container').is(':visible');
  }

  // Init interface
  var _init = function() {
    _initHistory();
    _addEventDelegations();
    _addTargetToLinks();
    _initProjectList();
    if ($('body').hasClass('page-detail')) {
      _addCaptionsToImages($('.detail-container'));
    }
  };

  var _redirectToHomeIfDetail = function() {
      //if ($('body').hasClass('page-detail')) document.location.href= "/";
  };

  var _initHistory = function() {

    // Reset popstate event
    $(window).unbind('popstate');

    // Bind popstate
    $(window).bind('popstate', function(event) {
      var state = event.originalEvent.state;
      if (_firstload && !state) {
        // Ignore first load
        _firstload = false;
      } else if (state) {
        // some state is returned
        _firstload = false;
        if (state.module && state.module != "") {
          action.notify({type: "history:popState", data: state});
        } else {
          window.location = state.url;
        }
      } else {
        // the original state returned
        _firstload = false;
        window.location = window.location.href;
      }
    });
  };



  var _addEventDelegations = function() {
    $('body').on('click', '[data-behaviour="open-detail"]', function(e){
      _redirectToHomeIfDetail();
      e.preventDefault();
      var projectUrl = $(this).attr('href');
      _openProjectDetail(projectUrl);
    });

    $('body').on('click', '[data-behaviour="close-detail"]', function(e){
      _redirectToHomeIfDetail();
      e.preventDefault();
      _closeProjectDetail();
    });

    $('body').on('click', '[data-behaviour="filter"]', function(e){
      _redirectToHomeIfDetail();
      e.preventDefault();
      var category = $(this).attr('data-category');
      _filterGridByCategory(category);
    });
  };

  var _initProjectList = function(){

    var $grid = $('.project-list .grid');

    $grid.masonry({
        itemSelector: '.project',
        columnWidth: _defaults.projectsGridColumnWidth,
        gutter: _defaults.projectsGridGutterWidth,
        isAnimated: true,
        animationOptions: {
          duration: 500,
          easing: 'easeInOutQuad',
          queue: false
        }
    });

    $grid.imagesLoaded().progress( function() {
      $grid.masonry('layout');
    });
  };

  var _openProjectDetail = function(url) {
    // Only if project detail is opened, clean the project detail before show
    if (_isProjectDetailOpened()) {
      _loadProjectDetail(url);
    } else {
      _lockProjectGridScroll();
      $('.overlay').fadeIn();
      $.scrollTo(0, 500, {
        easing: 'easeInOutQuad',
        onAfter: function() {
          _moveProjectDetailAndGrid(function() {
            _loadProjectDetail(url, function() {
              $('.detail-container').slideDown(500, 'easeInOutQuad');
            });
          });
        }
      });
    }
  };

  var _closeProjectDetail = function(callback) {

    // Slideup
    $('.detail-container').slideUp(500, 'easeInOutQuad', function() {

      $('.overlay').fadeOut();

      // move and unlock grid container
      $('.project-list').animate({
        'margin-left': '0px'
      }, 500, 'easeInOutQuad', function() {
        _unlockProjectGridScroll();
        $('.detail-container').empty();
        _pushState({ url: '/' });
        if (typeof callback == 'function') callback();
      });
    });
  };

  var _loadProjectDetail = function(url, callback){

    var $content = $('.detail-container');
    var $loader = $('<div>');

    $loader.load(url, function(response, status, xhr ) {
      if ( status == "error" ) {
        var msg = "Sorry but there was an error: ";
        alert( msg + xhr.status + " " + xhr.statusText );
        return;
      } else
      if ( status == "success" ) {
        var title = $loader.find('title').text();
        $content.empty();
        $content.append($loader.find('.detail-container .detail'));
        $content.find('img').each(function(){
          $(this).attr('src', url+$(this).attr('src'));
        });
        _addCaptionsToImages($content);
        var newState = {
          url: url,
          title: title
        }
        _pushState(newState);
        if (typeof callback == 'function') callback();
      }
    });

  };

  var _moveProjectDetailAndGrid = function(callback) {

    var newGridNewLeft = 0;
    newGridNewLeft = (_isProjectDetailOpened()) ? 0 : _defaults.projectItemsWidth;

    $('.project-list').animate({
      'margin-left': newGridNewLeft + 'px'
    }, 500, 'easeInOutQuad', function() {
      if (typeof callback == 'function')
        callback();
      }
    );

  };

  var _lockProjectGridScroll = function() {

    var currentScrollTop = $(window).scrollTop();
    var currentGridContainerWidth = $('section').width();

    $('.project-list').css({
      'width': currentGridContainerWidth,
      'position': 'fixed',
      'top': '-' + currentScrollTop + 'px'
    });

    $.scrollTo(0);
  };

  var _unlockProjectGridScroll = function() {

    var currentTop = $('.project-list').css('top');
    if (currentTop == 'auto')
      currentTop = 0;
    var newTop = Math.abs(parseInt(currentTop));

    $('.project-list').css({
      'width': 'auto',
      'top': 'auto',
      'position': 'relative'
    });

    $.scrollTo(newTop + 'px');
    $('.project-list .grid').masonry('layout');
  };

  var _addCaptionsToImages = function($container) {

    $container.each(function(){
      $images = $(this).find('.description img');
      $images.each(function() {
        var $wrapper = $(this).parent();
        if ($wrapper.hasClass('image')) return;
        $wrapper.addClass('image');

        var $img = $wrapper.find('img').clone();
        $wrapper.find('img').remove();
        $wrapper.wrapInner('<span class="caption"></span>');
        $wrapper.prepend($img);
      })
    });
  };

  var _addTargetToLinks = function() {

    var $detail = $('.detail');

    $detail.each(function(){
      $links = $(this).find('.description a');
      $links.each(function() {
        var $link = $(this);
        $link.attr('target', '_blank');
      })
    });
  };

  var _filterGridByCategory = function(category) {

    var $grid = $('.project-list .grid');

    _closeProjectDetail(function() {

      // Only if one tag is selected
      if (category != '') {

        // for each article tags
        $grid.find('.project').each(function() {

          var $project = $(this);
          var projectCategory = $project.attr('data-category');
          var willBeHidden = (category == projectCategory) ? false : true;

          // Hide if has the tag
          if (willBeHidden)
            $project.addClass('filtered');
          else
            $project.removeClass('filtered');
          }
        );
      } else {
        $('.project').removeClass('filtered');
      }

      // Refresh masonry
      $.scrollTo(0, {
        onAfter: function() {
          $grid.masonry('layout');
        }
      });

    });

  }

  var _pushState = function(state) {

    if (typeof(window.history.pushState) != 'function') return;
    
    var url = state.url || "";
    var title = state.title || "Matteo Mariotti";

    history.pushState(state, '', url);
    if (typeof title != 'undefined' && title != '')
      document.title = title;
  };

  // Returns the public methods
  return {
    init : _init
  };

})(jQuery);

// Main
$(document).ready(function() {
  MM.interface.init();
});

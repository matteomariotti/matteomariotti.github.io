var MM = MM || {};

MM.interface = (function($, undefined){

  // Default values
	var _defaults = {
			projectCoverNormalOpacity : 0.50,
			projectsGridColumnWidth : 140,
			projectsGridGutterWidth  : 20,
			projectItemsWidth : 802
  };
	
	// Status flags
  var _status = {
	
			projectDetailOpened : false,
			projectDetailSlideshow_currentItem : 0,
			projectDetailSlideshow_numOfItems : 0
			
  }
	
	// Init interface
	var _init = function() {

		_createAccessoryElements();
		_addProjectCoversEvents();
		_applyMasonry();
		//_updateFiltersPosition(false);
			
  };

	
	/* 
	 * Events for project covers 
	 */
	var _addProjectCoversEvents = function(){
		
		$('article').each(function(index, element) {
      	var title = $(this).find('.title strong').text();
				//$(this).find('.cover img').attr('title', title);
				$(this).find('.cover').append('<span>'+title+'</span>');
    });
		
		
		// lazy load of project covers
		$('.cover img').lazyImageLoader(function(el){
			// Sets normal opacity
			$(el).animate({
				opacity : _defaults.projectCoverNormalOpacity
			});
			//_applyMasonry();
		});
	
		// Configure hover event
		$('.cover').hover(
			function(){
				$(this).find('img').stop(true,true).animate({
					opacity : 1
				});
				$(this).find('span').stop(true,true).slideDown('fast');
			},
			function(){
				$(this).find('img').stop(true,true).animate({
					opacity : _defaults.projectCoverNormalOpacity
				});
				$(this).find('span').stop(true,true).slideUp('fast');
				
		});
			
		// Configure click event
		$('.cover').on('click',function(){
				$article = $(this).closest('article');
				_openProjectDetail($article);
				return false;
		});
		
	};
	
	/*
	 * Apply masonry effect
	 */
	var _applyMasonry = function(){
		var animated = true;
		if ($('html').hasClass('lt-ie9')) animated = false;
		
		$('section').masonry({
			  itemSelector: '.cover',
			  columnWidth: _defaults.projectsGridColumnWidth,
			  gutterWidth: _defaults.projectsGridGutterWidth,
			  isAnimated: animated,
				animationOptions: {
					duration: 500,
					easing: 'easeInOutQuad',
					queue: false,
					complete: function(){
						
						/*if($(this).hasClass('masonry')) {
							//_updateFiltersPosition(true);
							
						}*/
					}
				}
		});
	};
	
	var _refreshMasonry = function(){
			_applyMasonry();
	};
	
	
	/*
	 * Move project detail and grid together
	 */
	var _moveProjectDetailAndGrid = function(callback){
	
		var newGridNewLeft = 0;
		if (_status.projectDetailOpened) {
			newGridNewLeft = _defaults.projectItemsWidth+(_defaults.projectsGridGutterWidth*3);
		} else {
			newGridNewLeft = _defaults.projectsGridGutterWidth;
		}
		
	  $('section').animate({
			  'margin-left' : newGridNewLeft+'px'
		},500,'easeInOutQuad', function(){
			  if(typeof callback == 'function') callback();	
		});
		
	};
	
	
	var _openProjectDetail = function($project){
			
			// Only if project detail is opened, clean the project detail before show
			if (_status.projectDetailOpened) {
	
					$('#project_detail').slideUp(500,'easeInOutQuad', function(){
					  _showProjectDetail($project);	
					});		
		
			} 
			// If the project detail is hidden, lock the grid and close navigation
			else {
				
				_lockProjectGridScroll();
				$('#overlay').fadeIn();
				
				$.scrollTo(0, 500, {
			       easing : 'easeInOutQuad',
						 onAfter : function(){
	  						_moveProjectDetailAndGrid(function(){
								_showProjectDetail($project);
						 });
					}
				});
				
				_status.projectDetailOpened = true;
	
			}
	
	};
	
	/*
	 * Show a project 
	 */
	var _showProjectDetail = function($project){

		$('#project_detail').contents().remove();
		$('#project_detail').append('<div id="control_bar"></div>');
		
		$('#project_detail').append($project.find('.title').clone());
		$('#project_detail').append($project.find('.category').clone());
		$('#project_detail').append($project.find('.description').clone());
		$('#project_detail').append($project.find('.images').clone());
		
		$('#control_bar').append('<p id="project_title"></p>');
		
		// Close project link
		$('#control_bar').append('<a href="#" id="close_project" class="close_icon" title="cerrar"></a>');
		$('#close_project').click(function(){
				_closeProjectDetail();
				return false;
		});	

		$('#project_detail img').imgDataToSrc();
			
		$('#project_detail').slideDown(500,'easeInOutQuad');
		
		var htmlProjectTitle = $('#project_detail .title').html();
		if ($('#project_detail .category').length > 0) htmlProjectTitle = htmlProjectTitle + '<span> / '+$('#project_detail .category').html()+'</span>';
		$('#project_title').html(htmlProjectTitle);
				
		_status.projectDetailOpened = true;
	};
	
	/*
	 * Close the current project
	 */
	var _closeProjectDetail = function(callback){
		
		// Slideup
	 
		$('#project_detail').slideUp(500,'easeInOutQuad', function(){
			
			_status.projectDetailOpened = false;
			$('#overlay').fadeOut();

			// move and unlock grid container
			var newLeft = _defaults.projectsGridGutterWidth;
			$('section').animate({
				'margin-left' : newLeft+'px'
			},500,'easeInOutQuad', function(){
				
				_unlockProjectGridScroll();
				
				if(typeof callback == 'function') callback(); 
				
			});
		});
	};
			
	/*
	 * Lock the scroll to the project grid
	 */
	var _lockProjectGridScroll = function(){
		
		var currentScrollTop = $(window).scrollTop();
		var currentGridContainerWidth = $('section').width();
		
		$('section').css({
			'width' : currentGridContainerWidth,
			'position': 'fixed',
			'top': '-'+currentScrollTop+'px'
		});
		
		$.scrollTo(0);
	};
	
	/*
	 * Unlock the scroll to the project grid
	 */
	var _unlockProjectGridScroll = function(){
		
	   var currentTop = $('section').css('top');
	   if (currentTop == 'auto') currentTop = 0;
	   var newTop = Math.abs(parseInt(currentTop));
	 	   
	   $('section').css({
			'width' : 'auto',
			'top' : 'auto',
			'position': 'relative'
		});		
		
		$.scrollTo(newTop+'px');
		_applyMasonry();
	};
	
	/*
	 *  Create the accesory elements
	*/
	var _createAccessoryElements = function(){
		
			// Common containers
			$('body').prepend('<div id="overlay"></div>');
			$('body').prepend('<div id="project_detail"></div>');
			
			
			// Navigation
			$('header').append('<nav><ul></ul></nav>'); 

			// Project categories
		  var categories = _getDistinctCategories();
			
			// Create filter links
			for(index in categories) {
			  $('header ul').append('<li><a href="#" class="filter">'+categories[index]+'</a></li>');
			}
			
			// About link
			$('header ul').append('<li><a href="#" class="open_about">Perfil y contacto</a></li>');
			
			// Filter links events
			$('header ul a.filter').on('click',function(){
				
				$('header ul a.filter').removeClass('active');
				$(this).addClass('active');
				
				_filterGridByCategory($(this).text());
				return false;
			});
			
			// about link event
			$('header a.open_about').on('click', function(){
				_openProjectDetail($('article:first-child'));
				return false;
			});
			
			//$('header ul').css('width', $('header ul').outerWidth());
			
			$('#overlay').on('click', function(){
				_closeProjectDetail();
			});
		
	};
	
	/*
	 *  Get the distinct values for categories
	*/
	var _getDistinctCategories = function(){
		
		var categories = new Array();
				
		// for each article tags
		$('p.category').each(function() {
			
			var currentCategory = $(this).text();
			var wasFound = false;
			for (index in categories) {
				if (categories[index] == currentCategory) wasFound = true;
			}
			
			if(!wasFound) categories.push(currentCategory);
			
		});
		
		return categories;
		
	};
	
	var _updateFiltersPosition = function(animated){
		
		if(typeof animated == 'undefined') animated = true;
		var maximunLeft = 0;
		var gridMarginLeft = parseInt($('section').css('margin-left'));
		var filterWidth = $('header ul').outerWidth();
		
		$('section .cover').each(function(index, element) {
			var itemLeft = parseInt($(this).css('left'));
			if(itemLeft > maximunLeft) maximunLeft = itemLeft;
    });
		
		var newLeft = gridMarginLeft+maximunLeft+_defaults.projectsGridColumnWidth-filterWidth;
		
		if (animated) $('header ul').animate({'left': newLeft+'px'},200,'easeInOutQuart');
		else $('header ul').css('left', newLeft+'px');
	};
	
	/*
	 * Filter the projects by tag
	 */
	var _filterGridByCategory = function(category){
		  
			_closeProjectDetail(function(){
				
				// Only if one tag is selected
				if(category != ''){
					 
					 // for each article tags
					 $('article').each(function() {
						 
						 $article = $(this);
						 var willBeHidden = true;
						 
						 // Look for the tag
						 $article.find('p.category').each(function() {
							 if($(this).text() == category) willBeHidden = false;		
						 });
						 
						 // Hide if has the tag
						 if (willBeHidden) $article.addClass('filtered');
						 else $article.removeClass('filtered');
						
					 });
				
				} else {
					
					$('article').removeClass('filtered');
					
				}
				
				// Refresh masonry			
				$.scrollTo(0, { 
					 onAfter : function(){
						 _refreshMasonry();
					 }
				});
	
				
			});
			
	}
		
	// Returns the public methods
	return {
		init : _init
	}
	
	
})(jQuery);


// Jquery plugins
(function($){
	
  // Lazy loader for images 
  $.fn.lazyImageLoader = function(callback) {
	  
	  return this.each(function() {   
	  	  
		  $(this).wrap('<div class="image-loader"></div>');	
		  $(this).css('opacity','0');
		  $(this).load(function(){
			 $(this).parent().removeClass('image-loader');
			 if (typeof callback != 'undefined') callback(this);
			 else $(this).animate({'opacity' : 1}, 500);
		  });
		  if(this.complete || (jQuery.browser.msie && parseInt(jQuery.browser.version) == 6))  $(this).trigger("load");
	  });
  }
	
	// Load images 
	$.fn.imgDataToSrc = function(callback) {
	  
	  return this.each(function() {   
	  	  
		  $(this).attr('src',$(this).attr('data-src'));
			$(this).lazyImageLoader(function(el){
				$(el).animate({
					opacity : 1
			});
		});
			
	});
}
  
})(jQuery);

// Main 
$(document).ready(function() {
  MM.interface.init();
});

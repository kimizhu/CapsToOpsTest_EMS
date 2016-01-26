// Help methods
String.prototype.repeat = function(count) {
    if (this == null) {
        throw new TypeError('can\'t convert ' + this + ' to object');
    }
    var str = '' + this;
    count = +count;
    if (count != count) {
        count = 0;
    }
    if (count < 0) {
        throw new RangeError('repeat count must be non-negative');
    }
    if (count == Infinity) {
        throw new RangeError('repeat count must be less than infinity');
    }
    count = Math.floor(count);
    if (str.length == 0 || count == 0) {
        return '';
    }
    // Ensuring count is a 31-bit integer allows us to heavily optimize the
    // main part. But anyway, most current (August 2014) browsers can't handle
    // strings 1 << 28 chars or longer, so:
    if (str.length * count >= 1 << 28) {
        throw new RangeError('repeat count must not overflow maximum string size');
    }
    var rpt = '';
    for (;;) {
        if ((count & 1) == 1) {
        rpt += str;
        }
        count >>>= 1;
        if (count == 0) {
        break;
        }
        str += str;
    }
    return rpt;
}

String.prototype.format = String.prototype.f = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

function getpageRelativePath(target) {
    var toc = $("meta[name='toc']").attr('content');
    var currentFolder = toc.toLowerCase().split('toc.json')[0];
    return currentFolder + target;
};

function getRelativePath(source, target) {
    var sep = (source.indexOf("/") !== -1) ? "/" : "\\",
        targetArr = target.split(sep),
        sourceArr = source.split(sep);
        
    var lastMatch = "";
    
    while(targetArr.length > 0 && sourceArr.length > 0){
        if (targetArr[0] === sourceArr[0]){
        lastMatch = targetArr[0];
        targetArr.shift();
        sourceArr.shift();
        }
        else {
        break;
        }
    }
    
    if (sourceArr.length == 0){
        return "./" + lastMatch + "/" + targetArr.join('/');
    }
    
    return "../".repeat(sourceArr.length - 1) + targetArr.join('/');
}

// conceptual functions
function buildTOC() {
    var result = '';
    var tocloc = $("meta[name='toc']").attr('content');
    var json = getTOCJson(tocloc);
    json.forEach( function(item) {
        result += buildTOCblock(item);
    });
    return result;
};

function buildTOCblock(toc){
    var tocTemplate = '<ol><li><a href="{0}">{1}</a>';
    var currentTemplate = '<ol><li>{0}';
    var href = '';
    var result = '';
    if(toc.href != undefined) {
       href = getpageRelativePath(toc.href) + '.html';
    }
    if(toc.toc_title == document.title) {
        result = currentTemplate.format(toc.toc_title);
    }
    else {
        result = tocTemplate.format(href, toc.toc_title);
    }
    if(toc.children != undefined) {
      toc.children.forEach( function(child) {
        result += buildTOCblock(child);
      });
    }
    result += '</li></ol>';
    return result;
};

// reference functions
function contentFilter(platform, language) {
  // filter platform
  $('.list-clean').children().each( function() {
    if($(this).attr('class') != undefined && $(this).attr('class').indexOf('platform') >= 0) {
      $(this).hide();
      }
  });
  $('li.' + platform).show();
  $('header#overview').find('span').hide();
  $('.inheritance').find('code').hide();
  $('code[lang]').hide();
  $('code[class]').hide();
  $('.' + language).show();
  $('code[lang=\'' + language + '\']').each( function() { $(this).show()});
  var navigation = buildNav('navi');
  var mobilenavi = buildNav('mobilenavi');
  $('.navigation').empty();
  $('.navigation').append(navigation);
  $('.mobilenavi > select').empty();
  $('.mobilenavi > select').append(mobilenavi);
};
  
// build navigation
function buildNav(type) {
  if(type == 'mobilenavi') {
      var firstNav = '<option value="{0}">{1}</option>';
      var secondNav = '<option value="{0}">&nbsp;&nbsp;{1}</option>';
  }
  else if(type == 'navi') {
      var firstNav = '<h2><a href="#{0}">{1}</a></h2>';
      var secondNav = '<li><a href="#{0}" title="">{1}</a></li>';
  }
  var navigation = firstNav.format('overview', 'Overview');
  var overviewFlag = false;
  if($('header#summary').length) {
  overviewFlag = true;
    navigation += '<ul>' + secondNav.format('summary', 'Introduction');
  }
  if($('header#conceptual').length) {
  overviewFlag = true;
    navigation += secondNav.format('conceptual', 'Using');
  }
  if($('header#remarks').length) {
  overviewFlag = true;
    navigation += secondNav.format('remarks', 'Remarks');
  }
  if(overviewFlag) {
    navigation += '</ul>';
  }
    else {
    navigation = '';
  }
  // class block
  if($('header#constructors').length) {
    navigation = buildCodeNav(navigation, 'constructors', firstNav, secondNav);
  }
  if($('header#fields').length) {
    navigation = buildCodeNav(navigation, 'fields', firstNav, secondNav);
  }
  if($('header#properties').length) {
    navigation = buildCodeNav(navigation, 'properties', firstNav, secondNav);
  }
  if($('header#methods').length) {
    navigation = buildCodeNav(navigation, 'methods', firstNav, secondNav);
  }
  if($('header#events').length) {
    navigation = buildCodeNav(navigation, 'events', firstNav, secondNav);
  }
  if($('header#operators').length) {
    navigation = buildCodeNav(navigation, 'operators', firstNav, secondNav);
  }
  // namespace block
  if($('header#classes').length) {
      navigation = buildCodeNav(navigation, 'classes', firstNav, secondNav);
    }
  if($('header#interfaces').length) {
      navigation = buildCodeNav(navigation, 'interfaces', firstNav, secondNav);
    }
  if($('header#enums').length) {
      navigation = buildCodeNav(navigation, 'enums', firstNav, secondNav);
    }
  if($('header#delegates').length) {
      navigation = buildCodeNav(navigation, 'delegates', firstNav, secondNav);
    }
  return navigation;
};
  
function buildCodeNav(navigation, header, firstNav, secondNav) {
  var parentNav = firstNav.format(header, header) + '<ul>';
  var childNav = '';
  $('header#' + header).next().children().filter(':visible').each( function () {
    var id = $(this).attr('id');
    var name = $(this).find('h4').find('code').filter(':visible').text();
    childNav += secondNav.format(id, name);
  });
  if(childNav.length) {
    $('header#' + header).show();
    navigation += parentNav + childNav + '</ul>';
  }
  else {
    $('header#' + header).hide();
  }
  return navigation;
};

function buildReferenceBreadcrumb() {
  var breadcrumb = '';
  var namespace = '';
  
  var bcTemplate = '<li><a href="{0}">{1}</a></li>';
  var loc = $("meta[name='toc']").attr('content');
  var title = document.title.split(' ')[0];
  var json = getTOCJson(loc);
  json.forEach( function(item) {
    // namespace detected
    if(item.toc_title == title) {
      breadcrumb += '<li>' + document.title + '</li>';
      namespace = item.toc_title;
      return breadcrumb;
    }
    else{
      item.children.forEach( function(child) {
          // class detected
          if(child.toc_title == title) {
            var href = '';
            if(item.href != undefined) {
                href = getpageRelativePath(item.href) + '.html';
            }
            breadcrumb += bcTemplate.format(href, item.toc_title + ' namespace');
            namespace = item.toc_title;
            breadcrumb += '<li>' + document.title + '</li>';
          }
          return breadcrumb;
      });
    }
  });
  var globalBC = buildGlobalBreadcrumb(namespace, 'reference');
  breadcrumb = globalBC.substr(0, globalBC.lastIndexOf('<li>')) + breadcrumb;
  return breadcrumb;
};

function buildGlobalBreadcrumb(target, type) {
  var breadcrumb = '';
  var bcTemplate = '<li><a href="{0}">{1}</a></li>';
  var loc = $("meta[name='breadcrumb']").attr('content');
  if(type == 'conceptual') {
    var tocloc = $("meta[name='toc']").attr('content');
    target = toAbsolutePath(tocloc).toLowerCase().split('toc.json')[0];
  }
  var json = getTOCJson(loc);
  if(json == undefined) {
      return breadcrumb;
  }
  if(type == 'reference') {
      json.forEach(function(item) {
          breadcrumb = findTargetNamespace(item, target, breadcrumb);
      });
  }
  else {
      json.forEach(function(item) {
          breadcrumb = findTargetLoc(item, toAbsolutePath(tocloc).toLowerCase().split('toc.json')[0], breadcrumb);
      });
  }
  return breadcrumb;
};

function findTargetLoc(toc, targetTOC, path) {
    targetTOC = targetTOC.toLowerCase();
    if(toc.relative_path_in_depot != null && toc.relative_path_in_depot.toLowerCase() == targetTOC) {
        path = '<li>' + toc.toc_title + '</li>';
        return path;
    }
    else if(toc.children != null && path.length == 0) {
        toc.children.forEach(function(item) {
            path = findTargetLoc(item, targetTOC, path);
            return path;
        });
        if(path.length) {
            var href = '';
            if(toc.homepage != null) {
                href = toc.homepage;
            }
            path = '<li><a href="' + href + '">' + toc.toc_title + '</a></li>' + path;
               return path;
        }
    }
    return path;
}

function findTargetNamespace(toc, namespace, path) {
    namespace = namespace.toLowerCase();
    if(toc.toc_title != null && toc.toc_title.toLowerCase() == namespace) {
        path = '<li>' + toc.toc_title + '</li>';
        return path;
    }
    else if(toc.children != null && path.length == 0) {
        toc.children.forEach(function(item) {
            path = findTargetNamespace(item, namespace, path);
            return path;
        });
        if(path.length) {
            var href = '';
            if(toc.homepage != null) {
                href = toc.homepage;
            }
            path = '<li><a href="' + href + '">' + toc.toc_title + '</a></li>' + path;
               return path;
        }
    }
    return path;
}

function toAbsolutePath(relativePath) {
    var currentPath = location.pathname.substr(0, location.pathname.lastIndexOf('/'));
    if(relativePath.indexOf('/') == 0){
        return relativePath;
    }
    else if(!relativePath.indexOf('..') == 0) {
        return currentPath + '/' + relativePath;
    }
    else {
        relativePath.split('/').forEach(function(item){
            if(item == '..') {
                currentPath = currentPath.substr(0, currentPath.lastIndexOf('/'));
            }
            else {
                currentPath += '/' + item;
            }
        });
        return currentPath;
    }
};

// get json file
function getTOCJson(jsonURL) {
    var json = (function () {
        var json = null;
        $.ajax({
            'async':false,
            'global':false,
            'url':jsonURL,
            'dataType':"json",
            'success': function(data) {
                json = data;
            }
        });
        return json;
  })();
  return json;
}

// auto expand when navigation
function autoExpand(target) {
    var flag = $(target).find('.expander').attr('class');
    if(flag != undefined && flag.indexOf('collapsed') >= 0) {
        $(target).find('.expander').click();
    }
};
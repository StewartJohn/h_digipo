var tab_url = decodeURIComponent(location.href.replace(/chrome.+file=/,''));
var doctitle = document.querySelector('head title').innerText;

// These objects come from anchoring.js which repackages 
// https://github.com/hypothesis/client/tree/master/src/annotator/anchoring, 
// specifically range, types, util, and xpath.
// Those in turn repackage upstream npm libraries: 
// https://github.com/tilgovi/dom-anchor-text-position, dom-anchor-text-quote, dom-seek

var TextPositionAnchor = anchoring.TextPositionAnchor;
var TextQuoteAnchor = anchoring.TextQuoteAnchor;
var Range = anchoring.Range;
var Seek = anchoring.Seek;

// from pdf.coffee -> pdf.js

var pageTextCache = {};

var getSiblingIndex = function(node) {
  var siblings;
  siblings = Array.prototype.slice.call(node.parentNode.childNodes);
  return siblings.indexOf(node);
};

var getNodeTextLayer = function(node) {
  var ref1;
  while (!((ref1 = node.classList) != null ? ref1.contains('page') : void 0)) {
    node = node.parentNode;
  }
  return node.getElementsByClassName('textLayer')[0];
};

getPageTextContent = function(pageIndex) {
  var joinItems;
  if (pageTextCache[pageIndex] != null) {
    return pageTextCache[pageIndex];
  } else {
    joinItems = function(arg) {
      var item, items, nonEmpty, textContent;
      items = arg.items;
      nonEmpty = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = items.length; i < len; i++) {
          item = items[i];
          if (/\S/.test(item.str)) {
            results.push(item.str);
          }
        }
        return results;
      })();
      textContent = nonEmpty.join('');
      return textContent;
    };
    pageTextCache[pageIndex] = PDFViewerApplication.pdfViewer.getPageTextContent(pageIndex).then(joinItems);
    return pageTextCache[pageIndex];
  }
};

var getPageOffset = function(pageIndex) {
  var index, next;
  index = -1;
  next = function(offset) {
    if (++index === pageIndex) {
      return Promise.resolve(offset);
    }
    return getPageTextContent(index).then(function(textContent) {
      return next(offset + textContent.length);
    });
  };
  return next(0);
};

function do_selection() {

	var tab_url = decodeURIComponent(location.href.replace(/chrome.+file=/,''));
	var doctitle = document.querySelector('head title').innerText;

	if ( document.getSelection().toString() == ''  ) {
		return;
		}

	var range = document.getSelection().getRangeAt(0);

	// core selector acquisition logic from pdf.coffee (converted to pdf.js)

	range = new Range.BrowserRange(range).normalize();
	startTextLayer = getNodeTextLayer(range.start);
	endTextLayer = getNodeTextLayer(range.end);
	if (startTextLayer !== endTextLayer) {
	  throw new Error('selecting across page breaks is not supported');
	}
	startRange = range.limit(startTextLayer);
	endRange = range.limit(endTextLayer);
	startPageIndex = getSiblingIndex(startTextLayer.parentNode);
	endPageIndex = getSiblingIndex(endTextLayer.parentNode);
	iter = document.createNodeIterator(startTextLayer, NodeFilter.SHOW_TEXT);
	start = Seek(iter, range.start);
	end = Seek(iter, range.end) + start + range.end.textContent.length;
	getPageOffset(startPageIndex).then(function(pageOffset) {
		var position, quote, r;
		start += pageOffset;
		end += pageOffset;
		position = new TextPositionAnchor(document.body, start, end).toSelector({});
		r = document.createRange();
		r.setStartBefore(startRange.start);
		r.setEndAfter(endRange.end);
		quote = TextQuoteAnchor.fromRange(document.body, r, {}).toSelector({});

		// send selectors to the background script which can call the h api
		chrome.runtime.sendMessage(
			{
				action:'receive_selection',
				tab_url: tab_url,
				doctitle: doctitle,
				position_selector: position,
				quote_selector: quote
			},
			function(data) {
				console.log(data);
			});
		});
}

document.body.addEventListener('mouseup', do_selection);


function message() {
	alert('After you click OK you can make a selection and send it to Related Annotations');
}

document.addEventListener("DOMContentLoaded", message, false);





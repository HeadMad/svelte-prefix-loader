/*
 * HTML Parser By John Resig (ejohn.org)
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 *
 * // Use like so:
 * HTMLParser(htmlString, {
 *     start: function({rawTagName, lowerTagName}, attrs, unary) {},
 *     end: function(rawTagName) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 * // or to get an XML string:
 * HTMLtoXML(htmlString);
 *
 * // or to get an XML DOM Document
 * HTMLtoDOM(htmlString);
 *
 * // or to inject into an existing document/DOM node
 * HTMLtoDOM(htmlString, document);
 * HTMLtoDOM(htmlString, document.body);
 *
 */


// Regular Expressions for parsing tags and attributes
var REstartTag = /^<([-A-Za-z0-9_]+)((?:\s+[\w:\.]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
  // var REstartTag = /^<([-A-Za-z0-9_]+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
  REendTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/,
  REAttr = /([-A-Za-z0-9_:\.]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

// Empty Elements - HTML 5
var empty = makeMap("area,base,basefont,br,col,embed,frame,hr,img,input,isindex,link,menuitem,meta,param,source,track,wbr");

// Block Elements - HTML 4.01
var block = makeMap("address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");

// Inline Elements - HTML 4.01
var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

// Elements that you can, intentionally, leave open
// (and which close themselves)
var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

// Attributes that have their values filled in disabled="disabled"
var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

// Special Elements (can contain anything)
var special = makeMap("script,style");


function makeMap(str){
  var obj = {}, items = str.split(",");
  for ( var i = 0; i < items.length; i++ )
    obj[ items[i] ] = true;
  return obj;
}

const HTMLParser = function (html, handler) {
  var index, chars, match, stack = [], last = html;
  stack.last = function () {
    return this[this.length - 1];
  };

  while (html) {
    chars = true;

    // Make sure we're not in a script or style element
    if (!stack.last() || !special[stack.last()]) {

      // Comment
      if (html.indexOf("<!--") == 0) {
        index = html.indexOf("-->");

        if (index >= 0) {
          if (handler.comment)
            handler.comment(html.substring(4, index));
          html = html.substring(index + 3);
          chars = false;
        }

        // end tag
      } else if (html.indexOf("</") == 0) {
        match = html.match(REendTag);

        if (match) {
          html = html.substring(match[0].length);
          match[0].replace(REendTag, parseEndTag);
          chars = false;
        }

        // start tag
      } else if (html.indexOf("<") == 0) {
        match = html.match(REstartTag);

        if (match) {
          html = html.substring(match[0].length);
          match[0].replace(REstartTag, parseStartTag);
          chars = false;
        }
      }

      if (chars) {
        index = html.indexOf("<");

        var text = index < 0 ? html : html.substring(0, index);
        html = index < 0 ? "" : html.substring(index);

        if (handler.chars)
          handler.chars(text);
      }

    } else {
      html = html.replace(new RegExp("(.*)<\/" + stack.last() + "[^>]*>"), function (all, text) {
        text = text.replace(/<!--(.*?)-->/g, "$1")
          .replace(/<!\[CDATA\[(.*?)]]>/g, "$1");

        if (handler.chars)
          handler.chars(text);

        return "";
      });

      parseEndTag("", stack.last());
    }

    if (html == last)
      throw "Parse Error: " + html;
    last = html;
  }

  // Clean up any remaining tags
  parseEndTag();

  function parseStartTag(tag, RawTagName, rest, unary) {
    var tagName = RawTagName.toLowerCase();

    if (block[tagName]) {
      while (stack.last() && inline[stack.last()]) {
        parseEndTag("", stack.last());
      }
    }

    if (closeSelf[tagName] && stack.last() == tagName) {
      parseEndTag("", RawTagName);
    }

    unary = empty[tagName] || !!unary;

    if (!unary)
      stack.push(RawTagName);

    if (handler.start) {
      var attrs = [];

      rest.replace(REAttr, function (match, name) {
        var value = arguments[2] ? arguments[2] :
          arguments[3] ? arguments[3] :
            arguments[4] ? arguments[4] :
              fillAttrs[name] ? name : "";

        attrs.push({
          name: name,
          value: value,
          // escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
        });
      });

      let TagObj = { rawTagName: RawTagName, lowerTagName: tagName, toString: () => tagName }
      handler.start(TagObj, attrs, unary);

    }
  }

  function parseEndTag(tag, RawTagName) {
    // If no tag name is provided, clean shop
    if (!RawTagName)
      var pos = 0;

    // Find the closest opened tag of the same type
    else
      for (var pos = stack.length - 1; pos >= 0; pos--)
        if (stack[pos] == RawTagName)
          break;

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (var i = stack.length - 1; i >= pos; i--)
        if (handler.end) {
          handler.end(stack[i]);
        }


      // Remove the open elements from the stack
      stack.length = pos;
    }
  }
};

module.exports = HTMLParser

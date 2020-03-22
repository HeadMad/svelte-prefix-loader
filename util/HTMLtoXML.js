const HTMLParser = require("./HTMLParser")

const HTMLtoXML = function( html ) {
  var results = "";
  
  HTMLParser(html, {
    start: function( tag, attrs, unary ) {
      results += "<" + tag;
  
      for ( var i = 0; i < attrs.length; i++ )
        results += " " + attrs[i].name + '="' + attrs[i].escaped + '"';
  
      results += (unary ? "/" : "") + ">";
    },
    end: function( tag ) {
      results += "</" + tag + ">";
    },
    chars: function( text ) {
      results += text;
    },
    comment: function( text ) {
      results += "<!--" + text + "-->";
    }
  });
  
  return results;
};

module.exports = HTMLtoXML
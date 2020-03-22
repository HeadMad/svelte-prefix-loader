const HTMLParser = require("./HTMLParser")

const HTMLtoDOM = function( html, doc ) {
  // There can be only one of these elements
  var one = makeMap("html,head,body,title");
  
  // Enforce a structure for the document
  var structure = {
    link: "head",
    base: "head"
  };

  if ( !doc ) {
    if ( typeof DOMDocument != "undefined" )
      doc = new DOMDocument();
    else if ( typeof document != "undefined" && document.implementation && document.implementation.createDocument )
      doc = document.implementation.createDocument("", "", null);
    else if ( typeof ActiveX != "undefined" )
      doc = new ActiveXObject("Msxml.DOMDocument");
    
  } else
    doc = doc.ownerDocument ||
      doc.getOwnerDocument && doc.getOwnerDocument() ||
      doc;
  
  var elems = [],
    documentElement = doc.documentElement ||
      doc.getDocumentElement && doc.getDocumentElement();
      
  // If we're dealing with an empty document then we
  // need to pre-populate it with the HTML document structure
  if ( !documentElement && doc.createElement ) (function(){
    var html = doc.createElement("html");
    var head = doc.createElement("head");
    head.appendChild( doc.createElement("title") );
    html.appendChild( head );
    html.appendChild( doc.createElement("body") );
    doc.appendChild( html );
  })();
  
  // Find all the unique elements
  if ( doc.getElementsByTagName )
    for ( var i in one )
      one[ i ] = doc.getElementsByTagName( i )[0];
  
  // If we're working with a document, inject contents into
  // the body element
  var curParentNode = one.body;
  
  HTMLParser( html, {
    start: function( tagName, attrs, unary ) {
      // If it's a pre-built element, then we can ignore
      // its construction
      if ( one[ tagName ] ) {
        curParentNode = one[ tagName ];
        if ( !unary ) {
          elems.push( curParentNode );
        }
        return;
      }
    
      var elem = doc.createElement( tagName );
      
      for ( var attr in attrs )
        elem.setAttribute( attrs[ attr ].name, attrs[ attr ].value );
      
      if ( structure[ tagName ] && typeof one[ structure[ tagName ] ] != "boolean" )
        one[ structure[ tagName ] ].appendChild( elem );
      
      else if ( curParentNode && curParentNode.appendChild )
        curParentNode.appendChild( elem );
        
      if ( !unary ) {
        elems.push( elem );
        curParentNode = elem;
      }
    },
    end: function( tag ) {
      elems.length -= 1;
      
      // Init the new parentNode
      curParentNode = elems[ elems.length - 1 ];
    },
    chars: function( text ) {
      curParentNode.appendChild( doc.createTextNode( text ) );
    },
    comment: function( text ) {
      // create comment node
    }
  });
  
  return doc;
};

module.exports = HTMLtoDOM
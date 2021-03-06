/**
 * @file Handles communications with the server (including document collaboration) over Websockets.
 * @copyright This file is part of <a href='http://www.fiduswriter.org'>Fidus Writer</a>.
 *
 * Copyright (C) 2013 Takuto Kojima, Johannes Wilm.
 *
 * @license This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <a href='http://www.gnu.org/licenses'>http://www.gnu.org/licenses</a>.
 *
 */
(function () {
    var exports = this,
        /** Converts the node as it is shown and edited in the browser to and from the node as it is saved in the database and communicated with other editors. TODO 
         * @namespace nodeConverter
         */
        nodeConverter = {};
        
    nodeConverter.toView = function (modelNode) {
        var viewNode = modelNode.cloneNode(true), fnNodes = viewNode.querySelectorAll('.footnote'), newFn, neNodes = viewNode.querySelectorAll('figure, .citation, .equation');
        
        for (i = 0; i < fnNodes.length; i++) {
            
            newFn = document.createDocumentFragment();
            while(fnNodes[i].firstChild) {
                newFn.appendChild(fnNodes[i].firstChild);
            }
            newFn = nodeConverter.createFootnoteView(newFn);
            //fnNodes[i].parentNode.insertBefore(nodeConverter.beforeFootnote(), fnNodes[i]);
            fnNodes[i].parentNode.replaceChild(newFn, fnNodes[i]);
        }
        
        for (i = 0; i < neNodes.length; i++) {
            neNodes[i].setAttribute('contenteditable', false);
        }
        
        return viewNode;
    };
    
    nodeConverter.toModel = function (viewNode) {
        var modelNode = viewNode.cloneNode(true), agNodes = modelNode.querySelectorAll('.citation, .equation, .figure-equation'), fnNodes, newFn,
            neNodes = modelNode.querySelectorAll('figure, .citation, .equation'), i;
            
        for (i = 0; i < agNodes.length; i++) {
            while (agNodes[i].firstChild) {
                agNodes[i].removeChild(agNodes[i].firstChild);
            }
        }
        
        fnNodes = modelNode.querySelectorAll('.pagination-footnote');
        
        for (i = 0; i < fnNodes.length; i++) {
            newFn = document.createElement('span');
            while (fnNodes[i].firstChild.firstChild.firstChild) {
                newFn.appendChild(fnNodes[i].firstChild.firstChild.firstChild);
            }
            newFn.classList.add('footnote');
            newFn.contentEditable = 'inherit';
            fnNodes[i].parentNode.replaceChild(newFn, fnNodes[i]);
        }
        
        for (i=0; i < neNodes.length; i++) {
            neNodes[i].removeAttribute('contenteditable');
        }
        
       // modelNode.innerHTML = modelNode.innerHTML.replace(
       //     /[\u180e]/g,
       //     '');
        
        return modelNode;
    };
    
    nodeConverter.redoFootnotes = function () {
        document.getElementById('flow').dispatchEvent(pagination.events.redoEscapes);
    };
    
    nodeConverter.createFootnoteView = function (htmlFragment) {
        var fn = document.createElement('span'), id;
        fn.classList.add('pagination-footnote');
        
        fn.appendChild(document.createElement('span'));
        if (isFirefox) {
            fn.contentEditable = false;
            fn.firstChild.appendChild(document.createElement('div'));
            fn.firstChild.firstChild.contentEditable = true;
        } else {
            fn.appendChild(document.createTextNode('\u200b'));
            fn.firstChild.appendChild(document.createElement('span'));
        }
        fn.firstChild.firstChild.appendChild(htmlFragment);

        id=document.querySelectorAll('.pagionation-footnote').length;
        while(document.getElementById(id)) {
            id++;
        }
        fn.id = 'pagination-footnote-'+ id;
        return fn;
    };
    
    nodeConverter.createCiteView = function () {
        var citeNode = document.createElement('span');
        citeNode.classList.add('citation');
        citeNode.appendChild(document.createTextNode(' '));
        citeNode.setAttribute('contenteditable', false);
        return citeNode;
    };
    
    nodeConverter.createMathView = function () {
        mathNode = document.createElement('span');
        mathNode.classList.add('equation');
        mathNode.appendChild(document.createTextNode(' '));
        mathNode.setAttribute('contenteditable', false);
        return mathNode;        
    };
    
    nodeConverter.afterNode = function () {
        return document.createTextNode('\u205f');
    };
    
    
    /** Removes all the autogenerated contents from a node (mathjax and citation node contents) */
    nodeConverter.cleanNodeView = function (node) {
         var node = node.cloneNode(true), agNodes = node.querySelectorAll('.citation, .equation, .figure-equation'),
            i;
        for (i = 0; i < agNodes.length; i++) {
            while (agNodes[i].firstChild) {
                agNodes[i].removeChild(agNodes[i].firstChild);
            }
        }
        return node;
    };    


    exports.nodeConverter = nodeConverter;

}).call(this);
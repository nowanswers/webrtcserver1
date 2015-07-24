'use strict';

//info < log < debug < warn < error
// 5      4                     1      0
var DEBUG_LEVEL = ['off', 'error', 'warn', 'debug', 'log', 'info'];
var DEBUGMODE = 5;

/** handler for all uncaught errors */
window.onerror = function(message, url, linenumber) {
  _srvLog([message, url + " : " + linenumber], 'error' );
}.bind(this);

var _log = (function (methods, undefined) {

    var Log = Error; // does this do anything?  proper inheritance...?
    Log.prototype.write = function (args, method) {
        /// <summary>
        /// Paulirish-like console.log wrapper.  Includes stack trace via @fredrik SO suggestion (see remarks for sources).
        /// </summary>
        /// <param name="args" type="Array">list of details to log, as provided by `arguments`</param>
        /// <param name="method" type="string">the console method to use:  debug, log, warn, info, error</param>
        /// <remarks>Includes line numbers by calling Error object -- see
        /// * http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
        /// * http://stackoverflow.com/questions/13815640/a-proper-wrapper-for-console-log-with-correct-line-number
        /// * http://stackoverflow.com/a/3806596/1037948
        /// </remarks>

        // via @fredrik SO trace suggestion; wrapping in special construct so it stands out
        var suffix = //{
            //"@": (
              this.lineNumber
                    ? this.fileName + ':' + this.lineNumber + ":1" // add arbitrary column value for chrome linking
                    : extractLineNumberFromStack(this.stack)
            //)
        //}
        ;

        args = args.concat([suffix]);
        // via @paulirish console wrapper
        if (console && console[method]) {
            if (console[method].apply) { console[method].apply(console, args); } else { console[method](args); } // nicer display in some browsers
        }
        _srvLog(args, method);
    };

    var extractLineNumberFromStack = function (stack) {
        /// <summary>
        /// Get the line/filename detail from a Webkit stack trace.  See http://stackoverflow.com/a/3806596/1037948
        /// </summary>
        /// <param name="stack" type="String">the stack string</param>

        // correct line number according to how Log().write implemented
        var line = stack.split('\n')[3];
        // fix for various display text
        line = (line.indexOf(' (') >= 0
            ? line.split(' (')[1].substring(0, line.length - 1)
            : line.split('at ')[1]
            );
        return line;
    };

    // method builder
    var logMethod = function(method) {
        return function (params) {
            /// <summary>
            /// Paulirish-like console.log wrapper
            /// </summary>
            /// <param name="params" type="[...]">list your logging parameters</param>

            // only if explicitly true somewhere
            if (typeof DEBUGMODE === typeof undefined || !DEBUGMODE) return;

            // call handler extension which provides stack trace
            Log().write(Array.prototype.slice.call(arguments, 0), method); // turn into proper array & declare method to use
        };//--  fn  logMethod
    };
    var result = logMethod('log'); // base for backwards compatibility, simplicity
    // add some extra juice
    for(var i in methods) result[methods[i]] = logMethod(methods[i]);

    return result; // expose
})(['error', 'debug', 'info', 'warn', 'log']);//--- _log


function _srvLog(args, logtype) {

  var loglevel = DEBUG_LEVEL.indexOf(logtype);

  if( !DEBUGMODE || DEBUGMODE < loglevel ) return;

    var room = window.videoCtrl.room || 'na';//'noroom';
    var message ="";

    var userMsg = "";
    for(var i=0; i<(args.length-1); i++ ) {
      message += args[i];

      //TODO Is this a good place to display all user-friendly messages?
      if( logtype === 'error' ) {        
        if( typeof args[i] === "object" ) {
            if( 'NavigatorUserMediaError' == args[i].constructor.name ) {
                if ( args[i].name && args[i].name === "PermissionDeniedError" ) {
                    userMsg += "\n Your Camera is disabled.";                    
                }
                else {
                    userMsg += "\n" + args[i];
                }
            }
            else {
                userMsg += "\n" + args[i];
            }
        }
        else if( typeof args[i] === "string" ) {
            userMsg += "\n" + args[i];
        }
        else {
            userMsg += "\n" + args[i];
        }
      }
    }
    

    $.post("/logs",      
      {
        'type' : logtype,
        'roomid': room,
        'message' : message,
        'source' : args[args.length], //url + " : " + linenumber,
        //'line' : linenumber,
        'time' : $.now(),
        'browser' : navigator.userAgent
      },

      function (data, status) {
        //alert("An internal error occured");
        console.log('data: ' + data + '\n status: ' + status);
      });  
    
    if( logtype === 'error' ) {
        alert("Sorry, an error occured. \n" + userMsg);
    }
}
// var _log = (function (undefined) {
//     var Log = Error; // does this do anything?  proper inheritance...?
//     Log.prototype.write = function (args) {
//         /// <summary>
//         /// Paulirish-like console.log wrapper.  Includes stack trace via @fredrik SO suggestion (see remarks for sources).
//         /// </summary>
//         /// <param name="args" type="Array">list of details to log, as provided by `arguments`</param>
//         /// <remarks>Includes line numbers by calling Error object -- see
//         /// * http://paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
//         /// * http://stackoverflow.com/questions/13815640/a-proper-wrapper-for-console-log-with-correct-line-number
//         /// * http://stackoverflow.com/a/3806596/1037948
//         /// </remarks>

//         // via @fredrik SO trace suggestion; wrapping in special construct so it stands out
//         var suffix = {
//             "@": (this.lineNumber
//                     ? this.fileName + ':' + this.lineNumber + ":1" // add arbitrary column value for chrome linking
//                     : extractLineNumberFromStack(this.stack)
//             )
//         };

//         args = args.concat([suffix]);
//         // via @paulirish console wrapper
//         if (console && console.log) {
//             if (console.log.apply) { console.log.apply(console, args); } else { console.log(args); } // nicer display in some browsers
//         }
//     };
//     var extractLineNumberFromStack = function (stack) {
//         /// <summary>
//         /// Get the line/filename detail from a Webkit stack trace.  See http://stackoverflow.com/a/3806596/1037948
//         /// </summary>
//         /// <param name="stack" type="String">the stack string</param>

//         // correct line number according to how Log().write implemented
//         var line = stack.split('\n')[2];
//         // fix for various display text
//         line = (line.indexOf(' (') >= 0
//             ? line.split(' (')[1].substring(0, line.length - 1)
//             : line.split('at ')[1]
//             );
//         return line;
//     };

//     return function (params) {
//         /// <summary>
//         /// Paulirish-like console.log wrapper
//         /// </summary>
//         /// <param name="params" type="[...]">list your logging parameters</param>

//         // only if explicitly true somewhere
//         if (typeof DEBUGMODE === typeof undefined || !DEBUGMODE) return;

//         // call handler extension which provides stack trace
//         Log().write(Array.prototype.slice.call(arguments, 0)); // turn into proper array
//     };//--  fn  returned

// })();//--- _log




// var Srvlogger = function(debug) {
//   this.debug = debug;
//   var self = this;
//   this.logURL = '/logs';
//   this.log2Srv_ = function(msg) {
//   };
// };

// Srvlogger.prototype.log = function(msg) {
//   this.log2Srv_(  
//       {
//         'type' : 'log',
//         'roomid': this.room,
//         'error' : msg,
//         'source' : url,
//         'line' : linenumber,
//         'time' : $.now(),
//         'browser' : navigator.userAgent
//       }
//     );
//   if( this.debug ) {
//     console.log(msg);
//   }
// };

// Srvlogger.prototype.warn = function(msg) {
//   this.log2Srv_(  
//       {
//         'type' : 'warn',
//         'roomid': room,
//         'error' : msg,
//         'source' : url,
//         'line' : linenumber,
//         'time' : $.now(),
//         'browser' : navigator.userAgent
//       }
//     );
//   if( this.debug ) {
//     console.warn(msg);
//   }
// };

// Srvlogger.prototype.error = function(msg) {
//   this.log2Srv_(  
//       {
//         'type' : 'error',
//         'roomid': room,
//         'error' : msg,
//         'source' : url,
//         'line' : linenumber,
//         'time' : $.now(),
//         'browser' : navigator.userAgent
//       }
//     );
//   if( this.debug ) {
//     console.error(msg);
//   }  
// };

// Srvlogger.prototype.info = function(msg) {
//   this.log2Srv_(  
//       {
//         'type' : 'info',
//         'roomid': room,
//         'error' : message,
//         'source' : url,
//         'line' : linenumber,
//         'time' : $.now(),
//         'browser' : navigator.userAgent
//       }
//     );
//   if( this.debug ) {
//     console.info(msg);
//   }  
// };

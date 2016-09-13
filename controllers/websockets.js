'use strict'
module.exports = function(io){
    
        function emitToGroup(groupId, eventName, data) {
        io.to('group:'+groupId).emit(eventName, data);
        }
        
        function emitToUser (userId, eventName, data){
        io.to('user:'+userId).emit(eventName, data);
        }
    
        function emitToUsers(users, eventName, data){
            // Similar to emitToUser but takes in an array of user Ids to emit this event to
            for (let i = 0; i < users.length; i++){
                let userId = users[i];
                io.to('user:'+userId).emit(eventName,data);
            }
        }

    
        function addMembersToGroup(members, groupId){
              
            for (var i = 0 ; i < members.length; i++){
                try{
                     _addUserToGroup(members[i], groupId);
                }
                catch(e){
                    console.log(e);
                }
            }
            
            function _addUserToGroup(member, groupId){
                  try{
                    var usersSockets = Object.keys(io.nsps['/'].adapter.rooms['user:'+member].sockets);
                  }
                  catch (e) {
                    console.log("Error: " + e);
                    usersSockets = null;
                  }
                  finally {
                    if (usersSockets){
                      for (var i = 0; i < usersSockets.length; i++){
                        var socket = io.nsps['/'].connected[usersSockets[i]];
                        socket.join('group:'+groupId);
                      }
                    }
                }
            }
    }
    
    return {
    emitToGroup : emitToGroup,
    addMembersToGroup : addMembersToGroup,
    emitToUser : emitToUser,
    emitToUsers: emitToUsers,
    }

}
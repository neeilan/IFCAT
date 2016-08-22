var mongoose = require('mongoose');

var TutorialSchema = new mongoose.Schema({
    number: { type: String, required: true, trim: true},
    teachingAssistants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }]
}, {
    timestamps: true
});

// TutorialSchema.methods.generateGroups = function(size) {
//     /* (int) -> null
//     Assigns all students in the tutorial to groups of given size
//   */
//   var randomGroups = [];
//   var shuffledStudents = ArrayUtils.shuffle(this.students);
//   var index = 0;
//   while (index < shuffledStudents.length){
//     randomGroups.push(shuffledStudents.slice(0,index+size));
//     index+= size;
//   }
//   // Prevent one student from being left behind
//   if (shuffledStudents.length % size === 1){
//     randomGroups[randomGroups.length - 1].push(shuffledStudents[shuffledStudents.length -1]);
//   }
//   return randomGroups;
//   // OR this.groups = randomGroups;
//   // return this.save();
// }

module.exports = mongoose.model('Tutorial', TutorialSchema);

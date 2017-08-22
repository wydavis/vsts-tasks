var fs = require('fs');
var path = require('path');
var makeOptionsPath = path.join(__dirname, '..', 'make-options.json');
var makeOptions = JSON.parse(fs.readFileSync(makeOptionsPath).toString())
var tasks = makeOptions.tasks.filter(function (val, index) {
    return i % parseInt(process.env.SYSTEM_TOTALJOBSINPHASE) == parseInt(process.env.SYSTEM_JOBPOSITIONINPHASE) - 1;
});

console.log('##vso[task.setVariable variable=TASK_PATTERN]@(' + tasks.join('|') + ')');
console.log('##[task.setVariable variable=TASK_ARRAY]' + JSON.stringify(tasks));

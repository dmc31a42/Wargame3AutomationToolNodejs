const path = require('path');
const BtwProxyAndServiceModule = require('../BtwProxyAndServiceModule');
var moduleFolderNames = [
  'default',
  'SelectTeam',
  'ChatNotice'
];

module.exports = function(serverState, eugEmitter, eugRCON, btwUserAndDedicatedModules) {
    /**@type {BtwProxyAndServiceModule[]} */
    const importedModules = [];
    moduleFolderNames.forEach((element)=>{
        /**@type {BtwProxyAndServiceModule} */
        var importedModule = require("./" + element)(serverState, eugEmitter, eugRCON, btwUserAndDedicatedModules, path.join(path.dirname(__dirname),"/modules/" + element));
        if(!importedModule.moduleInfo){
            importedModule.moduleInfo = {
                name: element,
                path: element,
            };
            ////수정해야함
        } else {
            // if(!importedModule.moduleInfo.path) {
            //     importedModule.moduleInfo.path = element;
            // }
            if(!importedModule.moduleInfo.name) {
                importedModule.moduleInfo.name = element;
            }
        }
        importedModule.moduleInfo.path = element;
        importedModules.push(importedModule);
    })
    return importedModules;
}

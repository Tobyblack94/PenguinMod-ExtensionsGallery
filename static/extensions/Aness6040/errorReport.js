(function(Scratch) {
    'use strict';
    class Aness6040ErrorReport {
        getInfo() {
          return {
            id: 'aness6040errorreport',
            name: 'Error Report',
            color1: "#b01111",
            color2: "#730c0c",
            blocks: [
              {
                opcode: 'trydotoifablockerrors',
                blockType: Scratch.BlockType.CONDITIONAL,
                text: ['try to do', 'if a block errors'],
                branchCount: 2,
              }
            ]
          };
        }
      
        trydotoifablockerrors(args, util) {
            try {
                util.startBranch(1);
            } catch (error) {
                util.startBranch(2);
            }
        }
      }
      
    Scratch.extensions.register(new Aness6040ErrorReport());
  })(Scratch);
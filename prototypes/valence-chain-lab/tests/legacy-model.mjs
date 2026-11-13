// Freeze the old two-wave rules only for historical regression coverage.
export * from '../dist/model.mjs';
import {Run as CurrentRun,Lab as CurrentLab} from '../dist/model.mjs';
export class Lab extends CurrentLab{constructor(){super();this.maxLevel=5}}
export class Run extends CurrentRun{constructor(random){super(random);this.legacy=true;this.lab.maxLevel=5}reset(){super.reset();if(this.legacy)this.lab.maxLevel=5}}

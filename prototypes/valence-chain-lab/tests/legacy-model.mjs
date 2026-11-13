// Freeze the old two-wave rules only for historical regression coverage.
export * from '../dist/model.mjs';
import {Run as CurrentRun} from '../dist/model.mjs';
export class Run extends CurrentRun{constructor(random){super(random);this.legacy=true}}

import test from 'node:test';
import assert from 'node:assert/strict';
import {FocusTimer} from '../js/focus-timer.js';
test('focus timer accounts for time spent in a throttled background tab',()=>{
 let now=0;const timer=new FocusTimer(25,()=>now);timer.start();now=10*60*1000;
 assert.equal(timer.snapshot().seconds,15*60);now=30*60*1000;
 assert.deepEqual(timer.snapshot(),{seconds:0,progress:1,running:false,finished:true});
});
test('pause freezes the remaining time and resume preserves it',()=>{
 let now=0;const timer=new FocusTimer(5,()=>now);timer.start();now=60000;timer.pause();now+=3600000;
 assert.equal(timer.snapshot().seconds,240);timer.start();now+=30000;
 assert.equal(timer.snapshot().seconds,210);
});
test('changing duration or restarting a completed session gives a full session',()=>{
 let now=0;const timer=new FocusTimer(5,()=>now);timer.start();now=300000;timer.snapshot();timer.start();
 assert.equal(timer.snapshot().seconds,300);timer.setDuration(50);
 assert.equal(timer.snapshot().seconds,3000);assert.equal(timer.snapshot().running,false);
});

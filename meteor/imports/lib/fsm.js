import { ReactiveVar } from 'meteor/reactive-var';

import R from 'ramda';

import { capitalize } from '/imports/lib/capitalize';

// states: a list of strings
// events: a list of strings,
// transitions: a list of transitions each of which has the form
//       {state: <state>, event: <event>, result: <state>}
// actions: a list of actions, each of which has the form
//       {state: <state>, event: <event>, action: <actionFunction>}
// action function:  takes two arguments f(state, event);
//

export class FSM {
  constructor(states, events, transitions, start) {
    // Validate states
    const self = this;
    function checkString(value) {
      if (typeof(value) != 'string') {
        throw new Meteor.Error('FSM: invalid-value', `${value} is not a string`);
      }
      return value;
    }
    self.states = R.map(checkString, states);
    self.events = R.map(checkString, events);
    // validate start
    if (!R.includes(start, states)) {
      throw new Meteor.Error('FSM: invalid-start', `start state "${start} not in states"`);
    }
    self.current = new ReactiveVar(start);
    // validate transitions
    function checkTransition(t) {
      const c1 = R.includes(t.state, self.states);
      if (!c1) {
        throw new Meteor.Error('FSM: invalid-transition', `state ${t.state} is not in states`);
      }
      const c2 = R.includes(t.event, self.events);
      if (!c2) {
        throw new Meteor.Error('FSM: invalid-transition', `event ${t.event} is not in events`);
      }
      const c3 = R.includes(t.result, self.states)
      if (!c3) {
        throw new Meteor.Error('FSM: invalid-transition', `result ${t.result} is not in states`);
      }
      return t;
    }
    self.transitions = R.map(checkTransition, transitions);

    function addSignal(event) {
      self[event] = function() {
        return self.signal(event);
      }
    };

    R.map(addSignal, self.events);

    function addQuery(state) {
      const tag = 'is' + capitalize(state);
      self[tag] = function() {
        return self.current.get() === state;
      }
    }
    R.map(addQuery, self.states);

    this.actions = [];
  };

  state() {
    return this.current.get();
  }

  signal(event) {
    const currentState = this.state();
    function isMatch(transition) {
      if ((event === transition.event) && (currentState == transition.state)) return true;
      return false;
    }
    const transition = R.find(isMatch, this.transitions);
    const actions = R.filter(isMatch, this.actions);

    // if no matching transition is found, do nothing
    if (!transition) {
      console.log(`No transition for event ${event} in state ${currentState}`);
      return;
    }
    // Change state first, then execute actions using the prior state
    // as argument.  This should prevent a certain kind of loop.

    this.current.set(transition.result);
    function performAction(action){
      action.action(currentState, event);
    }

    R.map(performAction, actions)
  };

  addAction(action) {
    var actions = action;
    if (!Array.isArray(action)) {
      actions = [action]
    }
    const self = this;
    function validateAction(a) {
      const c1 = R.includes(a.state, self.states);
      if (!c1) {
        throw new Meteor.Error('FSM: invalid-action', `state ${a.state} is not in states`);
      }
      const c2 = R.includes(a.event, self.events);
      if (!c2) {
        throw new Meteor.Error('FSM: invalid-action', `event ${a.event} is not in events`);
      }
      const c3 = (typeof a.action == 'function');
      if (!c3) {
        throw new Meteor.Error('FSM: invalid-action', `action ${a.action} is not a function`);
      }
      return a;
    }
    self.actions = R.concat(self.actions, R.map(validateAction, actions));
  };
}

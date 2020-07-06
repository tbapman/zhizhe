import 'package:fish_redux/fish_redux.dart';

import 'action.dart';
import 'state.dart';

Reducer<ExerciseState> buildReducer() {
  return asReducer(
    <Object, Reducer<ExerciseState>>{
      ExerciseAction.action: _onAction,
    },
  );
}

ExerciseState _onAction(ExerciseState state, Action action) {
  final ExerciseState newState = state.clone();
  return newState;
}

import 'package:fish_redux/fish_redux.dart';
import 'action.dart';
import 'state.dart';

Effect<ExerciseState> buildEffect() {
  return combineEffects(<Object, Effect<ExerciseState>>{
    ExerciseAction.action: _onAction,
  });
}

void _onAction(Action action, Context<ExerciseState> ctx) {
}

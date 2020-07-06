import 'package:fish_redux/fish_redux.dart';

//TODO replace with your own action
enum ExerciseAction { action }

class ExerciseActionCreator {
  static Action onAction() {
    return const Action(ExerciseAction.action);
  }
}

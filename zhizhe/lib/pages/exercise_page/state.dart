import 'package:fish_redux/fish_redux.dart';

class ExerciseState implements Cloneable<ExerciseState> {

  @override
  ExerciseState clone() {
    return ExerciseState();
  }
}

ExerciseState initState(Map<String, dynamic> args) {
  return ExerciseState();
}

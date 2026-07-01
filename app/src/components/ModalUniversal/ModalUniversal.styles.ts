import { Dimensions, StyleSheet } from "react-native";
import colors from "../../styles/colors";

const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundButton: {
    position: "absolute",
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: colors.eminence,
    opacity: 0.1,
  },
});

export default styles;

export default function mencaoColor(mencao) {

  switch (mencao) {

    case "E":
      return "bg-blue-100 text-blue-800";

    case "MB":
      return "bg-green-200 text-green-900";

    case "B":
      return "bg-green-100 text-green-800";

    case "R":
      return "bg-yellow-100 text-yellow-800";

    case "I":
      return "bg-red-100 text-red-800";

    default:
      return "bg-slate-100 text-slate-700";
  }
}
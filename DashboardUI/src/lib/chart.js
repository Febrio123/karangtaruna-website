// Registrasi global composer Chart.js — di-import sekali oleh komponen yang
// memakai react-chartjs-2 agar tidak terjadi error "category is not a registered scale".
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
)

export { Chart }
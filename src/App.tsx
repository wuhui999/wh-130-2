import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import RoutineList from '@/pages/RoutineList'
import RoutineEdit from '@/pages/RoutineEdit'
import RhythmEdit from '@/pages/RhythmEdit'
import Practice from '@/pages/Practice'
import ExportImport from '@/pages/ExportImport'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<RoutineList />} />
          <Route path="/routine/:id/edit" element={<RoutineEdit />} />
          <Route path="/routine/:id/rhythm" element={<RhythmEdit />} />
          <Route path="/routine/:id/practice" element={<Practice />} />
          <Route path="/routine/:id/export" element={<ExportImport />} />
        </Route>
      </Routes>
    </Router>
  )
}

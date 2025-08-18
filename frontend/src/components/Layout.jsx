import Navbar from './Navbar'
import Sidebar from './Sidebar'

const Layout = ({children, showSidebar=false}) => {
  return (
    <div className='min-h-screen'>
        <div className='flex flex-col lg:flex-row' >
           { showSidebar && <Sidebar />}

           <div className='flex-1 flex flex-col' >
            <Navbar />

            <main className='flex-1 overflow-y-auto' >
                {children}
            </main>

           </div>
        </div>
    </div>
  )
}

export default Layout
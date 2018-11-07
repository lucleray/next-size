import dynamic from 'next/dynamic'
import '../style.css'

const DynamicComponent = dynamic(
  import(/* webpackChunkName: 'hello-component' */ '../components/hello')
)

export default () => (
  <div className="example">
    <DynamicComponent />
  </div>
)

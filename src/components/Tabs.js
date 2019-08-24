import React, {useState} from 'react'
import {Nav, NavItem, NavLink, TabContent, TabPane} from 'reactstrap'

export default function Tabs({labels, children}) {
  const [activeTab, setActiveTab] = useState(0)
  return (
    <div>
      <Nav tabs style={{marginBottom: 15}}>
        {labels.map((x, i) =>
          <NavItem key={i}>
            <NavLink
              className={activeTab === i ? 'active' : ''}
              onClick={() => setActiveTab(i)}
              >
              {x}
            </NavLink>
          </NavItem>
        )}
      </Nav>
      <TabContent activeTab={activeTab}>
        {React.Children.map(children, (x, i) =>
          <TabPane tabId={i}>{x}</TabPane>
        )}
      </TabContent>
    </div>
  )
}

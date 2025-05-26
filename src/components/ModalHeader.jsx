import {styled} from 'styled-components'
import {Flex } from '@sanity/ui'
import CincopaLogo from './CincopaLogo'

const Logo = styled.span`
  display: inline-block;
  height: 0.8em;
  margin-right: 1em;
  transform: translate(0.3em, -0.2em);
`

const ModalHeader = ({title}) => (
  <>
    <Flex align="center">
      <Logo>
        <CincopaLogo height={20} />
      </Logo>
      {title}
    </Flex>
  </>
);

export default ModalHeader;

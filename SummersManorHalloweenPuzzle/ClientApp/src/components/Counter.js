import React, { useState } from 'react';
import Button from 'react-bootstrap/Button'
import styled from 'styled-components';
import { Transition } from 'react-transition-group';

const NextRiddleText = styled.div`
  transition: opacity  ${props => props.duration}ms ease-in-out;
  opacity: ${props => (props.state === 'entering' || props.state === 'entered' ? '1' : '0')};
  color: white;
`;


export default function Count() {
    const [open, setOpen] = useState(true);
    return (
        <div>
            <Transition appear={true} in={open} timeout={500}>
                {state => (
                    <NextRiddleText state={state} duration={ 1000 }>
                        Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus
                        terry richardson ad squid. Nihil anim keffiyeh helvetica, craft beer
                        labore wes anderson cred nesciunt sapiente ea proident.
                    </NextRiddleText>
                )}
            </Transition>
            <Button onClick={() => setOpen(!open)}>
                Click to Toggle
            </Button>
        </div>        
    );
}

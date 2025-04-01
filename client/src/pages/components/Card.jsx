import React from 'react';

const Card = ({ elementName, elementImage, selectedElement, selected, handleSelection }) => {
    const isSelected = selectedElement === elementName;

    const cardStyle = {
        border: isSelected ? '2px solid blue' : '1px solid gray',
        padding: '10px',
        cursor: selected ? 'default' : 'pointer',
        display: 'inline-block',
        textAlign: 'center',
    };

    const imgStyle = {
        width: '50px',
        height: '50px',
    };

    return (
        <div
            style={cardStyle}
            onClick={!selected ? handleSelection : null}
            id={elementName}
        >
            <img style={imgStyle} src={elementImage} alt={elementName} />
        </div>
    );
};

export default Card;
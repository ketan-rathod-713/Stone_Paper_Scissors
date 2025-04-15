import React from 'react'

const Card = ({
  elementName,
  elementImage,
  selectedElement,
  selected,
  handleSelection
}) => {
  const isSelected = selectedElement === elementName

  return (
    <div
      className={`
                relative group p-4 rounded-xl transition-all duration-300 ease-in-out
                ${
                  isSelected
                    ? 'ring-4 ring-blue-500 scale-110'
                    : 'ring-1 ring-gray-200'
                }
                ${
                  !selected
                    ? 'hover:ring-4 hover:ring-blue-300 hover:scale-105 cursor-pointer'
                    : 'cursor-default'
                }
                bg-white shadow-md hover:shadow-lg
            `}
      onClick={() => !selected && handleSelection(elementName)}
      id={elementName}
    >
      <div className='flex flex-col items-center justify-center'>
        <img
          className='w-16 h-16 md:w-20 md:h-20 object-contain transition-transform duration-300 group-hover:scale-110'
          src={elementImage}
          alt={elementName}
        />
        <span className='mt-2 text-sm md:text-base font-medium text-gray-700'>
          {elementName}
        </span>
      </div>
    </div>
  )
}

export default Card

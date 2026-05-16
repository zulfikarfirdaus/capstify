import './ScrollIndicator.css'

export default function ScrollIndicator() {
  return (
    <div className="scroll-indicator" aria-hidden="true">
      <span className="scroll-indicator__label">Scroll</span>
      <div className="scroll-indicator__track">
        <div className="scroll-indicator__dot" />
      </div>
    </div>
  )
}

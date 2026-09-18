function FieldError({ message, id }: { message?: string; id?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-text-critical">
      {message}
    </p>
  )
}

export { FieldError }

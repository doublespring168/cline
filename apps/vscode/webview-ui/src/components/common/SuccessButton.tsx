import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"

interface SuccessButtonTWProps extends React.ComponentProps<typeof VSCodeButton> {}

const SuccessButtonTW: React.FC<SuccessButtonTWProps> = (props) => {
	return (
		<VSCodeButton
			{...props}
			className={`
				bg-[rgba(0,0,0,0.05)]!
				border-[rgba(0,0,0,0.1)]!
				text-foreground!
				hover:bg-[rgba(0,0,0,0.05)]!
				hover:border-[rgba(0,0,0,0.1)]!
				active:bg-[rgba(0,0,0,0.05)]!
				active:border-[rgba(0,0,0,0.1)]!
				${props.className || ""}
			`
				.replace(/\s+/g, " ")
				.trim()}
		/>
	)
}

export default SuccessButtonTW

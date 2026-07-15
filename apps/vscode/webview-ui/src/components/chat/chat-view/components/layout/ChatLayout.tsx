import type React from "react"
import styled from "styled-components"

interface ChatLayoutProps {
	isHidden: boolean
	chatFontSize: number
	children: React.ReactNode
}

/**
 * Main layout container for the chat view
 * Provides the fixed positioning and flex layout structure
 */
export const ChatLayout: React.FC<ChatLayoutProps> = ({ isHidden, chatFontSize, children }) => {
	return (
		<ChatLayoutContainer chatFontSize={chatFontSize} isHidden={isHidden}>
			<MainContent>{children}</MainContent>
		</ChatLayoutContainer>
	)
}

const ChatLayoutContainer = styled.div.withConfig({
	shouldForwardProp: (prop) => !["chatFontSize", "isHidden"].includes(prop),
})<{ isHidden: boolean; chatFontSize: number }>`
	display: ${(props) => (props.isHidden ? "none" : "grid")};
	--vscode-font-size: ${(props) => `${props.chatFontSize}px`};
	--vscode-editor-font-size: ${(props) => `${props.chatFontSize}px`};
	font-size: var(--vscode-font-size);
	grid-template-rows: 1fr auto;
	overflow: hidden;
	padding: 0;
	margin: 0;
	width: 100%;
	height: 100%;
	min-height: 100vh;
	position: relative;
`

const MainContent = styled.div`
	display: flex;
	flex-direction: column;
	overflow: hidden;
	grid-row: 1;
`

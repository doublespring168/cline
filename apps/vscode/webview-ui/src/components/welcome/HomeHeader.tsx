import ClineLogoVariable from "@/assets/ClineLogoVariable"
import { useExtensionState } from "@/context/ExtensionStateContext"

const HomeHeader = () => {
	const { environment } = useExtensionState()

	return (
		<div className="flex flex-col items-center mb-5">
			<div className="my-7">
				<ClineLogoVariable className="size-20" environment={environment} />
			</div>
			<div className="text-center flex items-center justify-center px-4">
				<h1 className="m-0 font-bold">What can I do for you?</h1>
			</div>
		</div>
	)
}

export default HomeHeader

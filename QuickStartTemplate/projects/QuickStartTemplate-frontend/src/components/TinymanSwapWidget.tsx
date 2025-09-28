import React, { useEffect, useRef, useState } from 'react'
import { WidgetController } from '@tinymanorg/tinyman-swap-widget-sdk'
import { SignerTransaction } from '@tinymanorg/tinyman-js-sdk'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { BsArrowLeftRight, BsCheckCircle, BsExclamationCircle } from 'react-icons/bs'
import { NetworkToggleValue } from '@tinymanorg/tinyman-swap-widget-sdk/dist/constants'
//import { NetworkToggleValue } from '@tinymanorg/tinyman-swap-widget-sdk'

interface TinymanSwapWidgetProps {
  openModal: boolean
  closeModal: () => void
}

const TinymanSwapWidget = ({ openModal, closeModal }: TinymanSwapWidgetProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const widgetControllerRef = useRef<WidgetController | null>(null)
  const { enqueueSnackbar } = useSnackbar()
  const { activeAddress, transactionSigner } = useWallet()
  const [isLoading, setIsLoading] = useState(false)

  // Widget options for iframe URL generation
  const widgetOptions = {
    useParentSigner: true as const,
    accountAddress: activeAddress || '',
    network: NetworkToggleValue.TestNet, // Change to NetworkToggleValue.MainNet for production
    platformName: 'AlgoVault'
    // Optional: customize widget appearance
    // themeVariables: { theme: SwapWidgetAppTheme.Dark }
  }

  // Initialize widget controller and event listeners
  useEffect(() => {
    if (!activeAddress) return

    const onTxnSignRequest = async ({ txGroups }: { txGroups: SignerTransaction[][] }) => {
      if (!transactionSigner || !activeAddress) {
        enqueueSnackbar('Wallet not connected', { variant: 'error' })
        WidgetController.sendMessageToWidget({
          data: { message: { type: 'FAILED_TXN_SIGN', error: 'Wallet not connected' } },
          targetWindow: iframeRef.current?.contentWindow
        })
        return
      }

      try {
      setIsLoading(true)
      enqueueSnackbar('Signing transaction...', { variant: 'info' })

      // Sign the transactions using the wallet's transaction signer
      // You may need to adjust the logic below to fit your wallet's transactionSigner API
      const flatTxns = txGroups.flat().map((stx) => stx.txn)
      // Sign all transactions by default (indexes: 0..N-1)
      const indexesToSign = flatTxns.map((_, idx) => idx)
      const signedTxns = await transactionSigner(flatTxns, indexesToSign)

      // Send the signed transactions back to the widget
      WidgetController.sendMessageToWidget({
        data: { message: { type: 'TXN_SIGN_RESPONSE', signedTxns } },
        targetWindow: iframeRef.current?.contentWindow
      })

        enqueueSnackbar('Transaction signed successfully', { variant: 'success' })
      } catch (error) {
        console.error('Transaction signing failed:', error)
        enqueueSnackbar('Transaction signing failed', { variant: 'error' })

        // Notify widget about the failure
        WidgetController.sendMessageToWidget({
          data: { message: { type: 'FAILED_TXN_SIGN', error } },
          targetWindow: iframeRef.current?.contentWindow
        })
      } finally {
        setIsLoading(false)
      }
    }

    const onTxnSignRequestTimeout = () => {
      console.error('Widget stopped waiting for transaction signing')
      enqueueSnackbar('Transaction signing timed out', { variant: 'warning' })
      setIsLoading(false)
    }

    const onSwapSuccess = () => {
      console.log('Swap was successful!')
      enqueueSnackbar('Swap completed successfully!', { variant: 'success' })
      setIsLoading(false)
    }

    // Create widget controller instance
    const widgetController = new WidgetController({
      onTxnSignRequest,
      onTxnSignRequestTimeout,
      onSwapSuccess
    })

    widgetControllerRef.current = widgetController

    // Add event listeners
    widgetController.addWidgetEventListeners()

    // Cleanup function
    return () => {
      widgetController.removeWidgetEventListeners()
    }
  }, [activeAddress, transactionSigner, enqueueSnackbar])

  // Generate widget iframe URL
  const iframeUrl = WidgetController.generateWidgetIframeUrl(widgetOptions)

  return (
    <dialog
      id="tinyman_swap_modal"
      className={`modal modal-bottom sm:modal-middle backdrop-blur-sm ${openModal ? 'modal-open' : ''}`}
    >
      <div className="modal-box bg-neutral-800 text-gray-100 rounded-2xl shadow-xl border border-neutral-700 p-6 max-w-md w-full">
        <h3 className="flex items-center gap-3 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
          <BsArrowLeftRight className="text-3xl" />
          Tinyman Swap
        </h3>

        {!activeAddress ? (
          <div className="flex flex-col items-center py-8 space-y-4">
            <BsExclamationCircle className="text-4xl text-yellow-500" />
            <p className="text-center text-gray-300">
              Please connect your wallet to use the swap widget
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {isLoading && (
              <div className="flex items-center justify-center py-4 space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-blue-400">Processing transaction...</span>
              </div>
            )}

            <div className="rounded-xl overflow-hidden border border-neutral-600">
              <iframe
                ref={iframeRef}
                id="swap-widget-iframe"
                src={iframeUrl}
                width="100%"
                height="500"
                style={{ border: 0 }}
                title="Tinyman Swap Widget"
                className="bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>

            <div className="text-xs text-gray-400 text-center">
              <BsCheckCircle className="inline mr-1" />
              Powered by Tinyman DEX on Algorand
            </div>
          </div>
        )}

        <div className="modal-action mt-6">
          <button
            className="btn w-full bg-neutral-700 hover:bg-neutral-600 border-none text-gray-300 rounded-xl"
            onClick={closeModal}
            disabled={isLoading}
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default TinymanSwapWidget
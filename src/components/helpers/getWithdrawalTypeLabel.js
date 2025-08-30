export	const getWithdrawalTypeLabel = (withdrawalType) => {
		const labels = {
			lost: 'Perdido',
			returned: 'Devuelto',
			damaged: 'Dañado',
			expired: 'Vencido'
		}
		return labels[withdrawalType] || withdrawalType
	}
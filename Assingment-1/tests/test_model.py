import unittest
import numpy as np
import pandas as pd
from generate_pdf_reports import generate_synthetic_data, calculate_fairness_metrics, compute_reweighing_weights

class TestBiasMitigationPipeline(unittest.TestCase):
    
    def setUp(self):
        # Set up a small test DataFrame
        self.df = pd.DataFrame({
            'gender': ['Male', 'Male', 'Female', 'Female', 'Male', 'Female'],
            'hired': [1, 0, 1, 0, 1, 0]
        })
        
    def test_data_generation(self):
        df_synthetic = generate_synthetic_data(num_samples=100)
        self.assertEqual(len(df_synthetic), 100)
        self.assertIn('gender', df_synthetic.columns)
        self.assertIn('hired', df_synthetic.columns)
        self.assertIn('experience', df_synthetic.columns)
        self.assertIn('test_score', df_synthetic.columns)
        self.assertIn('education_level', df_synthetic.columns)
        
        # Verify that there are only Male and Female entries
        genders = df_synthetic['gender'].unique()
        self.assertTrue(set(genders).issubset({'Male', 'Female'}))

    def test_fairness_metrics_calculation(self):
        # Add predictions column to our mock df
        # Mock prediction: selection rate: Male = 2/3 (0.666), Female = 1/3 (0.333)
        self.df['mock_pred'] = [1, 0, 1, 0, 1, 0]
        
        metrics = calculate_fairness_metrics(self.df, 'mock_pred')
        
        # Selection rate Male: 2/3 = ~0.667
        self.assertAlmostEqual(metrics['selection_rate_privileged'], 2/3)
        # Selection rate Female: 1/3 = ~0.333
        self.assertAlmostEqual(metrics['selection_rate_unprivileged'], 1/3)
        # Disparate Impact Ratio: (1/3) / (2/3) = 0.5
        self.assertAlmostEqual(metrics['disparate_impact_ratio'], 0.5)
        # Statistical Parity Difference: 1/3 - 2/3 = -0.333
        self.assertAlmostEqual(metrics['statistical_parity_difference'], -1/3)

    def test_reweighing_weights(self):
        weights = compute_reweighing_weights(self.df)
        
        # Ensure weights array length matches the dataframe length
        self.assertEqual(len(weights), len(self.df))
        
        # Weights should all be positive
        self.assertTrue(np.all(weights > 0))
        
        # Ensure weights correctly balance the groups
        # Sum of weights for (Male, Hired) should equal expected count
        df_weighted = self.df.copy()
        df_weighted['weights'] = weights
        
        weighted_male_hired = df_weighted[(df_weighted['gender'] == 'Male') & (df_weighted['hired'] == 1)]['weights'].sum()
        weighted_female_hired = df_weighted[(df_weighted['gender'] == 'Female') & (df_weighted['hired'] == 1)]['weights'].sum()
        
        # In a perfectly balanced dataset, weighted counts should reflect expectations
        # The reweighing formula ensures P(A, Y) * W = P(A) * P(Y)
        # Let's verify sum of weights is equal to total count
        self.assertAlmostEqual(df_weighted['weights'].sum(), len(self.df))

if __name__ == '__main__':
    unittest.main()
